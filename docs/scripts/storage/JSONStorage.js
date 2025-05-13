export class JSONStorage {
    #storage;
    #rootStorageKey;
    #internalMap;
    constructor(storage, root) {
        this.#storage = storage;
        this.#rootStorageKey = root;
        const localItems = this.#storage.getItem(root);
        if (localItems) {
            const localMap = JSON.parse(localItems);
            this.#internalMap = new Map(localMap);
        }
        else {
            this.#internalMap = new Map;
        }
    }
    get length() {
        return this.#internalMap.size;
    }
    ;
    clear() {
        this.#internalMap.clear();
        this.#storage.removeItem(this.#rootStorageKey);
    }
    getItem(key) {
        return this.#internalMap.get(key) ?? null;
    }
    key(index) {
        return Array.from(this.#internalMap.keys())[index] ?? null;
    }
    removeItem(key) {
        this.#internalMap.delete(key);
        if (this.#internalMap.size === 0) {
            this.#storage.removeItem(this.#rootStorageKey);
        }
        else {
            this.#storage.setItem(this.#rootStorageKey, JSON.stringify(Array.from(this.#internalMap)));
        }
    }
    setItem(key, value) {
        this.#internalMap.set(key, value);
        this.#storage.setItem(this.#rootStorageKey, JSON.stringify(Array.from(this.#internalMap)));
    }
    allKeys() {
        return Array.from(this.#internalMap.keys());
    }
}
