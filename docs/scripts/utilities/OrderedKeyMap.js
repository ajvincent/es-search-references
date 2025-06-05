var _a;
export class OrderedKeyMap extends Map {
    static #keyComparator(a, b) {
        return a.localeCompare(b);
    }
    static #entryComparator(a, b) {
        return a[0].localeCompare(b[0]);
    }
    #keysArray = [];
    #isBatchUpdate = true;
    constructor(entries) {
        entries.sort(_a.#entryComparator);
        super(entries);
        this.#keysArray = entries.map(e => e[0]);
        this.#isBatchUpdate = false;
        this.set = this.#set;
    }
    batchUpdate(callback) {
        this.#isBatchUpdate = true;
        try {
            callback();
            this.#keysArray.sort(_a.#keyComparator);
        }
        finally {
            this.#isBatchUpdate = false;
        }
    }
    delete(key) {
        const rv = super.delete(key);
        if (rv) {
            this.#keysArray.splice(this.#keysArray.indexOf(key), 1);
        }
        return rv;
    }
    #set(key, value) {
        const hadValue = this.has(key);
        const rv = super.set(key, value);
        if (hadValue)
            return rv;
        if (this.#isBatchUpdate) {
            this.#keysArray.push(key); // batch update will sort this later.
        }
        else {
            let min = 0, max = this.#keysArray.length;
            while (min < max) {
                const mid = Math.floor((min + max) / 2);
                const currentKey = this.#keysArray[mid];
                if (_a.#keyComparator(currentKey, key) < 0) {
                    min = mid + 1;
                }
                else {
                    max = mid;
                }
            }
            this.#keysArray.splice(min, 0, key);
        }
        return rv;
    }
    keys() {
        return this.#keysArray.values();
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
_a = OrderedKeyMap;
