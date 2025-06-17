import { OrderedStringIterator } from "./OrderedStringIterator.js";
import { WeakRefSet } from "./WeakRefSet.js";
export class OrderedStringSet {
    #iterators = new WeakRefSet;
    #set;
    constructor(elements = []) {
        this.#set = new Set(elements);
    }
    add(value) {
        const hadValue = this.#set.has(value);
        this.#set.add(value);
        if (hadValue === false) {
            for (const iterator of this.#iterators.liveElements()) {
                iterator.itemAdded(value);
            }
        }
        return this;
    }
    clear() {
        this.#set.clear();
        for (const iterator of this.#iterators.liveElements()) {
            iterator.setCleared();
        }
    }
    delete(value) {
        const wasDeleted = this.#set.delete(value);
        if (wasDeleted) {
            for (const iterator of this.#iterators.liveElements()) {
                iterator.itemDeleted(value);
            }
        }
        return wasDeleted;
    }
    has(value) {
        return this.#set.has(value);
    }
    get size() {
        return this.#set.size;
    }
    *[Symbol.iterator]() {
        const values = Array.from(this.#set);
        values.sort();
        const iterator = new OrderedStringIterator(values);
        this.#iterators.addReference(iterator);
        for (const value of iterator) {
            yield value;
        }
        this.#iterators.deleteReference(iterator);
    }
}
