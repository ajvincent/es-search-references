export default class WeakStrongMap {
    #root = new WeakMap;
    constructor(iterable) {
        if (iterable) {
            for (const [weakKey, strongKey, value] of iterable) {
                this.set(weakKey, strongKey, value);
            }
        }
    }
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param weakKey - The weakly held key.
     * @param strongKey - The strongly held key.
     * @returns True if we found the value and deleted it.
     */
    delete(weakKey, strongKey) {
        const innerMap = this.#root.get(weakKey);
        if (!innerMap)
            return false;
        const rv = innerMap.delete(strongKey);
        if (innerMap.size === 0) {
            this.#root.delete(weakKey);
        }
        return rv;
    }
    /**
     * Get a value for a key set.
     *
     * @param weakKey - The weakly held key.
     * @param strongKey - The strongly held key.
     * @returns The value.  Undefined if it isn't in the collection.
     */
    get(weakKey, strongKey) {
        return this.#root.get(weakKey)?.get(strongKey);
    }
    /**
     * Guarantee a value for a key set.
     *
     * @param weakKey - The weakly held key.
     * @param strongKey - The strongly held key.
     * @param defaultGetter - A function to provide a default value if necessary.
     * @returns The value.
     */
    getDefault(weakKey, strongKey, defaultGetter) {
        if (!this.has(weakKey, strongKey)) {
            const result = defaultGetter();
            this.set(weakKey, strongKey, result);
            return result;
        }
        return this.get(weakKey, strongKey);
    }
    strongKeysFor(weakKey) {
        const innerMap = this.#root.get(weakKey);
        return new Set(innerMap?.keys() ?? []);
    }
    *entriesFor(weakKey) {
        const innerMap = this.#root.get(weakKey);
        if (innerMap)
            yield* innerMap.entries();
    }
    hasStrongKeys(weakKey) {
        const innerMap = this.#root.get(weakKey);
        if (!innerMap)
            return false;
        return innerMap.size > 0;
    }
    /**
     * Report if the collection has a value for a key set.
     *
     * @param weakKey -The weakly held key.
     * @param strongKey - The strongly held key.
     * @returns True if the key set refers to a value in the collection.
     */
    has(weakKey, strongKey) {
        return this.#root?.get(weakKey)?.has(strongKey) ?? false;
    }
    /**
     * Set a value for a key set.
     *
     * @param weakKey - The weakly held key.
     * @param strongKey - The strongly held key.
     * @param value - The value.
     */
    set(weakKey, strongKey, value) {
        if (!this.#root.has(weakKey)) {
            this.#root.set(weakKey, new Map);
        }
        this.#root.get(weakKey).set(strongKey, value);
        return this;
    }
    [Symbol.toStringTag] = "WeakStrongMap";
}
Object.freeze(WeakStrongMap);
Object.freeze(WeakStrongMap.prototype);
