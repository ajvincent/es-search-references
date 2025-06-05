export class OrderedKeyMap<V> extends Map<string, V> {
  static #keyComparator(a: string, b: string): number {
    return a.localeCompare(b);
  }
  static #entryComparator(a: [string, unknown], b: [string, unknown]): number {
    return a[0].localeCompare(b[0]);
  }

  #keysArray: string[] = [];
  #isBatchUpdate = true;

  constructor(entries: [string, V][]) {
    entries.sort(OrderedKeyMap.#entryComparator);
    super(entries);
    this.#keysArray = entries.map(e => e[0]);
    this.#isBatchUpdate = false;
    this.set = this.#set;
  }

  batchUpdate(callback: () => void): void {
    this.#isBatchUpdate = true;
    try {
      callback();
      this.#keysArray.sort(OrderedKeyMap.#keyComparator);
    } finally {
      this.#isBatchUpdate = false;
    }
  }

  delete(key: string): boolean {
    const rv = super.delete(key);
    if (rv) {
      this.#keysArray.splice(this.#keysArray.indexOf(key), 1);
    }
    return rv;
  }

  #set(key: string, value: V): this {
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
        if (OrderedKeyMap.#keyComparator(currentKey, key) < 0) {
          min = mid + 1;
        } else {
          max = mid;
        }
      }
      this.#keysArray.splice(min, 0, key);
    }

    return rv;
  }

  keys(): IterableIterator<string> {
    return this.#keysArray.values();
  }

  * values(): IterableIterator<V> {
    for (const key of this.keys()) {
      yield this.get(key)!;
    }
  }

  * entries(): IterableIterator<[string, V]> {
    for (const key of this.keys()) {
      yield [key, this.get(key)!];
    }
  }
}
