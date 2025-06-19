import {
  OrderedStringIterator
} from "./OrderedStringIterator.js";

import {
  WeakRefSet
} from "./WeakRefSet.js";

export class OrderedStringSet {
  readonly #iterators = new WeakRefSet<OrderedStringIterator>;
  readonly #set: Set<string>;

  constructor(elements: string[] = []) {
    this.#set = new Set(elements);
  }

  add(value: string): this {
    const hadValue = this.#set.has(value);
    this.#set.add(value);
    if (hadValue === false) {
      for (const iterator of this.#iterators.liveElements()) {
        iterator.itemAdded(value);
      }
    }
    return this;
  }

  clear(): void {
    this.#set.clear();
    for (const iterator of this.#iterators.liveElements()) {
      iterator.setCleared();
    }
  }

  delete(value: string): boolean {
    const wasDeleted = this.#set.delete(value);
    if (wasDeleted) {
      for (const iterator of this.#iterators.liveElements()) {
        iterator.itemDeleted(value);
      }
    }
    return wasDeleted;
  }

  has(value: string): boolean {
    return this.#set.has(value);
  }

  get size(): number {
    return this.#set.size;
  }

  * [Symbol.iterator](): ArrayIterator<string> {
    const values = Array.from(this.#set);
    values.sort();

    const iterator = new OrderedStringIterator(values);
    this.#iterators.addReference(iterator);

    yield* iterator;

    this.#iterators.deleteReference(iterator);
  }
}
