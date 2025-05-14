var _a;
import { JSONStorage } from "./JSONStorage.js";
export class FileSystemMap extends Map {
    static #storage = new JSONStorage(window.localStorage, "es-search-references/files");
    static getAll() {
        const entries = [];
        for (const systemKey of this.#storage.allKeys()) {
            const items = this.#storage.getItem(systemKey);
            entries.push([systemKey, new _a(systemKey, items)]);
        }
        return new Map(entries);
    }
    #systemKey;
    #isBatchUpdate = true;
    constructor(systemKey, entries) {
        super(entries);
        this.#systemKey = systemKey;
        this.#isBatchUpdate = false;
        this.#refreshStorage();
    }
    #refreshStorage() {
        if (this.size) {
            _a.#storage.setItem(this.#systemKey, Array.from(this.entries()));
        }
        else {
            _a.#storage.removeItem(this.#systemKey);
        }
    }
    batchUpdate(callback) {
        this.#isBatchUpdate = true;
        try {
            callback();
            this.#refreshStorage();
        }
        finally {
            this.#isBatchUpdate = false;
        }
    }
    clear() {
        super.clear();
        this.#refreshStorage();
    }
    delete(key) {
        const rv = super.delete(key);
        if (rv) {
            this.#refreshStorage();
        }
        return rv;
    }
    set(key, value) {
        super.set(key, value);
        try {
            if (!this.#isBatchUpdate)
                this.#refreshStorage();
        }
        catch (ex) {
            // do nothing, this is normal during construction
        }
        return this;
    }
}
_a = FileSystemMap;
