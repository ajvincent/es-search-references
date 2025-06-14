export class OrderedStringSet {
    #elements;
    constructor(elements = []) {
        this.#elements = elements.toSorted();
    }
    #insertionIndex(value) {
        let min = 0, max = this.#elements.length;
        while (min < max) {
            const mid = (min + max) >> 1;
            const currentValue = this.#elements[mid];
            if (currentValue.localeCompare(value) < 0) {
                min = mid + 1;
            }
            else {
                max = mid;
            }
        }
        return min;
    }
    add(value) {
        const index = this.#insertionIndex(value);
        if (this.#elements[index] !== value) {
            this.#elements.splice(index, 0, value);
        }
        return this;
    }
    clear() {
        this.#elements = [];
    }
    delete(value) {
        const index = this.#insertionIndex(value);
        if (this.#elements[index] !== value) {
            return false;
        }
        this.#elements.splice(index, 1);
        return true;
    }
    has(value) {
        const index = this.#insertionIndex(value);
        return this.#elements[index] === value;
    }
    get size() {
        return this.#elements.length;
    }
    [Symbol.iterator]() {
        return this.#elements.values();
    }
}
