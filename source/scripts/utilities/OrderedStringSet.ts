export class OrderedStringSet {
  #elements: string[];

  constructor(elements: string[] = []) {
    this.#elements = elements.toSorted();
  }

  #insertionIndex(value: string): number {
    let min = 0, max = this.#elements.length;
    while (min < max) {
      const mid = (min + max) >> 1;
      const currentValue = this.#elements[mid];
      if (currentValue.localeCompare(value) < 0) {
        min = mid + 1;
      } else {
        max = mid;
      }
    }

    return min;
  }

  add(value: string): this {
    const index = this.#insertionIndex(value);
    if (this.#elements[index] !== value) {
      this.#elements.splice(index, 0, value);
    }
    return this;
  }

  clear(): void {
    this.#elements = [];
  }

  delete(value: string): boolean {
    const index = this.#insertionIndex(value);
    if (this.#elements[index] !== value) {
      return false;
    }

    this.#elements.splice(index, 1);
    return true;
  }

  has(value: string): boolean {
    const index = this.#insertionIndex(value);
    return this.#elements[index] === value;
  }

  get size(): number {
    return this.#elements.length;
  }

  [Symbol.iterator](): ArrayIterator<string> {
    return this.#elements.values();
  }
}
