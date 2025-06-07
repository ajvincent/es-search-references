var _a;
import { JSONStorage } from "./JSONStorage.js";
import { OrderedKeyMap } from "../utilities/OrderedKeyMap.js";
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
    static #getParentAndLeaf(key) {
        let lastSlash = key.lastIndexOf("/");
        if (lastSlash === -1) {
            return ["", key];
        }
        const parent = key.substring(0, lastSlash);
        const leaf = key.substring(lastSlash + 1);
        return [parent, leaf];
    }
    static #defineFile(topObject, map, pathToFile, contents) {
        const [parent, leaf] = _a.#getParentAndLeaf(pathToFile);
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
        const [parent, leaf] = _a.#getParentAndLeaf(pathToDirectory);
        if (parent) {
            const dictionary = _a.#requireDirectory(topObject, map, parent);
            dictionary[leaf] = dir;
        }
        else {
            topObject[leaf] = dir;
        }
        return dir;
    }
    systemKey;
    #isBatchUpdate = false;
    constructor(systemKey, entries) {
        super(entries);
        this.systemKey = systemKey;
        this.#refreshStorage();
        this.set = this.#set.bind(this);
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
    #set(key, value) {
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
}
_a = FileSystemMap;
