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
    systemKey;
    #isBatchUpdate = false;
    constructor(systemKey, entries) {
        super(entries);
        this.systemKey = systemKey;
        this.#refreshStorage();
        this.set = this.#set.bind(this);
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
}
_a = FileSystemMap;
