/** @deprecated */
export class OrderedKeyMap extends Map {
    static keyComparator(a, b) {
        return a.localeCompare(b);
    }
    static #entryComparator(a, b) {
        return a[0].localeCompare(b[0]);
    }
    keysArray = [];
    #isBatchUpdate = false;
    constructor(entries) {
        super();
        entries.sort(OrderedKeyMap.#entryComparator);
        this.keysArray = entries.map(e => e[0]);
        for (const [key, value] of entries) {
            super.set(key, value);
        }
    }
    batchUpdate(callback) {
        this.#isBatchUpdate = true;
        try {
            callback();
            this.keysArray.sort(OrderedKeyMap.keyComparator);
        }
        finally {
            this.#isBatchUpdate = false;
        }
    }
    delete(key) {
        const rv = super.delete(key);
        if (rv) {
            this.keysArray.splice(this.keysArray.indexOf(key), 1);
        }
        return rv;
    }
    deleteByIndices(startIndex, endIndex) {
        if (!this.#isBatchUpdate) {
            throw new Error("deleteByIndices is only allowed during a batch update");
        }
        const keysToDelete = this.keysArray.splice(startIndex, endIndex - startIndex);
        for (const key of keysToDelete) {
            super.delete(key);
        }
    }
    getInsertionIndex(key) {
        let min = 0, max = this.keysArray.length;
        while (min < max) {
            const mid = (min + max) >> 1;
            const currentKey = this.keysArray[mid];
            if (OrderedKeyMap.keyComparator(currentKey, key) < 0) {
                min = mid + 1;
            }
            else {
                max = mid;
            }
        }
        return min;
    }
    set(key, value) {
        const hadValue = super.has(key);
        super.set(key, value);
        if (hadValue)
            return this;
        if (this.#isBatchUpdate) {
            this.keysArray.push(key); // batch update will sort this later.
        }
        else {
            const index = this.getInsertionIndex(key);
            this.keysArray.splice(index, 0, key);
        }
        return this;
    }
    indexOfKey(key) {
        const index = this.getInsertionIndex(key);
        if (index === this.keysArray.length)
            return -1;
        return this.keysArray[index] === key ? index : -1;
    }
    keys() {
        return this.keysArray.values();
    }
    *values() {
        for (const key of this.keys()) {
            yield this.get(key);
        }
    }
    *entries() {
        for (const key of this.keys()) {
            yield [key, this.get(key)];
        }
    }
}
