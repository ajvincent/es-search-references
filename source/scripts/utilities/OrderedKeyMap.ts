/** @deprecated */
export class OrderedKeyMap<V> extends Map<string, V> {
  protected static keyComparator(a: string, b: string): number {
    return a.localeCompare(b);
  }

  static #entryComparator(a: [string, unknown], b: [string, unknown]): number {
    return a[0].localeCompare(b[0]);
  }

  protected readonly keysArray: string[] = [];
  #isBatchUpdate = false;

  constructor(entries: [string, V][]) {
    super();
    entries.sort(OrderedKeyMap.#entryComparator);
    this.keysArray = entries.map(e => e[0]);
    for (const [key, value] of entries) {
      super.set(key, value);
    }
  }

  batchUpdate(callback: () => void): void {
    this.#isBatchUpdate = true;
    try {
      callback();
      this.keysArray.sort(OrderedKeyMap.keyComparator);
    } finally {
      this.#isBatchUpdate = false;
    }
  }

  delete(key: string): boolean {
    const rv = super.delete(key);
    if (rv) {
      this.keysArray.splice(this.keysArray.indexOf(key), 1);
    }
    return rv;
  }

  protected deleteByIndices(startIndex: number, endIndex: number): void {
    if (!this.#isBatchUpdate) {
      throw new Error("deleteByIndices is only allowed during a batch update");
    }
    const keysToDelete = this.keysArray.splice(startIndex, endIndex - startIndex);
    for (const key of keysToDelete) {
      super.delete(key);
    }
  }

  protected getInsertionIndex(key: string): number {
    let min = 0, max = this.keysArray.length;
    while (min < max) {
      const mid = (min + max) >> 1;
      const currentKey = this.keysArray[mid];
      if (OrderedKeyMap.keyComparator(currentKey, key) < 0) {
        min = mid + 1;
      } else {
        max = mid;
      }
    }

    return min;
  }

  set(key: string, value: V): this {
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

  indexOfKey(key: string): number {
    const index = this.getInsertionIndex(key);
    if (index === this.keysArray.length)
      return -1;
    return this.keysArray[index] === key ? index : -1;
  }

  keys(): IterableIterator<string> {
    return this.keysArray.values();
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
