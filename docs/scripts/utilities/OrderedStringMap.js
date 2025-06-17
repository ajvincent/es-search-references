import { OrderedStringSet } from "./OrderedStringSet.js";
export class OrderedStringMap extends Map {
    #keys;
    constructor(entries = []) {
        super();
        const keys = [];
        for (const [key, value] of entries) {
            super.set(key, value);
            keys.push(key);
        }
        this.#keys = new OrderedStringSet(keys);
    }
    clear() {
        super.clear();
        this.#keys.clear();
    }
    delete(key) {
        const rv = super.delete(key);
        if (rv) {
            this.#keys.delete(key);
        }
        return rv;
    }
    forEach(callbackfn, thisArg) {
        for (const key of this.#keys) {
            callbackfn.call(thisArg, super.get(key), key, this);
        }
    }
    set(key, value) {
        this.#keys.add(key);
        return super.set(key, value);
    }
    entries() {
        return this[Symbol.iterator]();
    }
    keys() {
        return this.#keys[Symbol.iterator]();
    }
    *values() {
        for (const key of this.#keys) {
            yield this.get(key);
        }
    }
    *[Symbol.iterator]() {
        for (const key of this.#keys) {
            yield [key, this.get(key)];
        }
    }
    [Symbol.toStringTag] = "OrderedStringMap";
}
