import {
  OrderedStringSet
} from "./OrderedStringSet.js";

export class OrderedStringMap<V> extends Map<string, V> {
  readonly #keys: OrderedStringSet;

  constructor(entries: [string, V][] = []) {
    super();
    const keys: string[] = [];
    for (const [key, value] of entries) {
      super.set(key, value);
      keys.push(key);
    }
    this.#keys = new OrderedStringSet(keys);
  }

  clear(): void {
    super.clear();
    this.#keys.clear();
  }

  delete(key: string): boolean {
    const rv = super.delete(key);
    if (rv) {
      this.#keys.delete(key);
    }
    return rv;
  }

  forEach(callbackfn: (value: V, key: string, map: OrderedStringMap<V>) => void, thisArg?: any): void {
    for (const key of this.#keys) {
      callbackfn.call(thisArg, super.get(key)!, key, this);
    }
  }

  set(key: string, value: V): this {
    this.#keys.add(key);
    return super.set(key, value);
  }

  entries(): MapIterator<[string, V]> {
    return this[Symbol.iterator]();
  }

  keys(): MapIterator<string> {
    return this.#keys[Symbol.iterator]();
  }

  * values(): MapIterator<V> {
    for (const key of this.#keys) {
      yield this.get(key)!;
    }
  }

  * [Symbol.iterator](): MapIterator<[string, V]> {
    for (const key of this.#keys) {
      yield [key, this.get(key)!];
    }
  }

  readonly [Symbol.toStringTag] = "OrderedStringMap";
}
