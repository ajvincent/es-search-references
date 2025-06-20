var _a;
import { JSONStorage } from "./JSONStorage.js";
import { OrderedKeyMap } from "../utilities/OrderedKeyMap.js";
import { getParentAndLeaf } from "../utilities/getParentAndLeaf.js";
/** @deprecated */
export class FileSystemMap extends OrderedKeyMap {
    static #storage = new JSONStorage(window.localStorage, "es-search-references/files");
    static getAll() {
        const entries = [];
        for (const systemKey of this.#storage.allKeys()) {
            if (systemKey === "reference-spec-filesystem") {
                continue;
            }
            const items = this.#storage.getItem(systemKey);
            entries.push([systemKey, new _a(systemKey, items)]);
        }
        return new OrderedKeyMap(entries);
    }
    static allKeys() {
        return _a.#storage.allKeys();
    }
    static #encoder = new TextEncoder();
    static #defineFile(topObject, map, pathToFile, contents) {
        const [parent, leaf] = getParentAndLeaf(pathToFile);
        const byteArray = _a.#encoder.encode(contents);
        if (parent) {
            const dir = _a.#requireDirectory(topObject, map, parent);
            dir[leaf] = byteArray;
        }
        else {
            topObject[leaf] = byteArray;
        }
    }
    static #requireDirectory(topObject, map, pathToDirectory) {
        if (map.has(pathToDirectory))
            return map.get(pathToDirectory);
        const dir = {};
        map.set(pathToDirectory, dir);
        const [parent, leaf] = getParentAndLeaf(pathToDirectory);
        if (parent) {
            const dictionary = _a.#requireDirectory(topObject, map, parent);
            dictionary[leaf] = dir;
        }
        else {
            topObject[leaf] = dir;
        }
        return dir;
    }
    static #afterKeyComparator(a, b) {
        if (a.startsWith(b))
            return -1;
        return a.localeCompare(b);
    }
    systemKey;
    #isBatchUpdate = false;
    constructor(systemKey, entries) {
        super(entries);
        this.systemKey = systemKey;
        this.#refreshStorage();
    }
    clone(newSystemKey) {
        const entries = Array.from(this.entries());
        return new _a(newSystemKey, entries);
    }
    #refreshStorage() {
        if (this.systemKey === "reference-spec-filesystem")
            return;
        if (this.size) {
            _a.#storage.setItem(this.systemKey, Array.from(this.entries()));
        }
        else {
            _a.#storage.removeItem(this.systemKey);
        }
    }
    batchUpdate(callback) {
        this.#isBatchUpdate = true;
        try {
            super.batchUpdate(callback);
            this.#refreshStorage();
        }
        finally {
            this.#isBatchUpdate = false;
        }
    }
    clear() {
        super.clear();
        if (!this.#isBatchUpdate)
            this.#refreshStorage();
    }
    delete(key) {
        const rv = super.delete(key);
        if (rv && !this.#isBatchUpdate) {
            this.#refreshStorage();
        }
        return rv;
    }
    set(key, value) {
        super.set(key, value);
        if (!this.#isBatchUpdate)
            this.#refreshStorage();
        return this;
    }
    exportAsJSON() {
        const result = {
            packages: {},
            urls: {}
        };
        const packagesMap = new Map;
        const urlsMap = new Map;
        for (const [pathToFile, contents] of this.entries()) {
            let topObject;
            let map;
            let remainingPath;
            const url = URL.parse(pathToFile);
            if (url) {
                const head = url.protocol.substring(0, url.protocol.length - 1);
                topObject = result.urls;
                map = urlsMap;
                remainingPath = head + "/" + url.pathname.substring(1);
            }
            else {
                topObject = result.packages;
                map = packagesMap;
                remainingPath = pathToFile;
            }
            _a.#defineFile(topObject, map, remainingPath, contents);
        }
        return result;
    }
    hasPath(parentPath) {
        const index = this.getInsertionIndex(parentPath);
        return (index < this.keysArray.length && this.keysArray[index].startsWith(parentPath));
    }
    /*
    batchPaste(
      fromParentPath: string,
      toParentPath: string,
      entries: [string, string][]
    ): void
    {
      if (!fromParentPath.endsWith("/"))
        throw new Error("fromParentPath must end with a slash");
      if (!toParentPath.endsWith("/"))
        throw new Error("toParentPath must end with a slash");
      throw new Error("not yet implemented");
    }
    */
    batchRename(fromParentPath, toParentPath) {
        if (!fromParentPath.endsWith("/"))
            throw new Error("fromParentPath must end with a slash");
        if (!toParentPath.endsWith("/"))
            throw new Error("toParentPath must end with a slash");
        this.batchUpdate(() => this.#batchRename(fromParentPath, toParentPath));
    }
    batchDelete(parentPath) {
        if (!parentPath.endsWith("/"))
            throw new Error("parentPath must end with a slash");
        this.batchUpdate(() => this.#batchDelete(parentPath));
    }
    #batchRename(fromParentPath, toParentPath) {
        const startIndex = this.getInsertionIndex(fromParentPath);
        const endIndex = this.#getAfterKeyIndex(fromParentPath);
        const keysToDelete = this.keysArray.slice(startIndex, endIndex);
        const collectedEntries = [];
        for (const key of keysToDelete) {
            collectedEntries.push([key.replace(fromParentPath, toParentPath), this.get(key)]);
        }
        this.deleteByIndices(startIndex, endIndex);
        for (const [newPath, contents] of collectedEntries) {
            this.set(newPath, contents);
        }
    }
    #batchDelete(parentPath) {
        const startIndex = this.getInsertionIndex(parentPath);
        const endIndex = this.#getAfterKeyIndex(parentPath);
        this.deleteByIndices(startIndex, endIndex);
    }
    #getAfterKeyIndex(key) {
        let min = 0, max = this.keysArray.length;
        while (min < max) {
            const mid = (min + max) >> 1;
            const currentKey = this.keysArray[mid];
            if (_a.#afterKeyComparator(currentKey, key) < 0) {
                min = mid + 1;
            }
            else {
                max = mid;
            }
        }
        return min;
    }
}
_a = FileSystemMap;
