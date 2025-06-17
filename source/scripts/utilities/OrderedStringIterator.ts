export interface OrderedStringIteratorIfc extends Iterable<string> {
  itemAdded(
    value: string
  ): void;

  itemDeleted(value: string): void;

  setCleared(): void;
}

/**
 * @internal
 *
 * An iterator for an ordered string set, where we respond gracefully to
 * mutations from the parent set.
 */
export class OrderedStringIterator implements OrderedStringIteratorIfc {
  static #stringOrUndefinedComparator(a: string | undefined, b: string | undefined): number {
    if (a === undefined)
      return +1;
    if (b === undefined)
      return -1;
    return a.localeCompare(b);
  }

  static #insertionIndex(elements: string[], value: string, min: number): number {
    let max = elements.length;
    while (min < max) {
      const mid = (min + max) >> 1;
      const currentValue = elements[mid];
      if (currentValue.localeCompare(value) < 0) {
        min = mid + 1;
      } else {
        max = mid;
      }
    }

    return min;
  }

  /* The primary thinking behind this is merge sort:
  - #primaryQueue is the cache we're working off of
  - #secondaryQueue is items added during iteration
  - keep both queues sorted, but only from their index to the end
  - the indexes allow us to avoid shifting elements off the arrays
  - when the secondary queue's length is greater than the primary queue:
    1. merge the two queues together and make the primary queue the result
    2. reset the indices

  The idea is you pay the price in frequent inserts, less so in frequent deletes,
  while iterating.
  */

  #primaryQueue: string[];
  #primaryIndex = 0;
  #secondaryQueue: string[] = [];
  #secondaryIndex = 0;

  /**
   * Items we've already visited and exclude from further iteration.
   *
   */
  #visitedItems: Pick<Set<string>, "add" | "has"> = new Set;

  /**
   * Items we've deleted but can re-add.  Visited items should never be here.
   */
  #deletedItems = new Set<string>;

  /**
   * precondition: values is already sorted
   */
  constructor(values: string[]) {
    this.#primaryQueue = values;
  }

  /**
   * precondition: the value was not in the parent set before insertion.
   */
  itemAdded(
    value: string
  ): void
  {
    if (this.#visitedItems.has(value)) {
      return;
    }

    const index = OrderedStringIterator.#insertionIndex(this.#secondaryQueue, value, this.#secondaryIndex);
    this.#secondaryQueue.splice(index, 0, value);
    this.#deletedItems.delete(value);
  }

  /**
   * precondition: the value was in the parent set before deletion.
   */
  itemDeleted(value: string): void {
    if (this.#visitedItems.has(value)) {
      return;
    }

    this.#deletedItems.add(value);
  }

  setCleared(): void {
    this.#primaryQueue = [];
    this.#primaryIndex = 0;
    this.#secondaryQueue = [];
    this.#secondaryIndex = 0;
    this.#deletedItems.clear();
  }

  * [Symbol.iterator](): ArrayIterator<string> {
    while (this.#primaryIndex + this.#secondaryIndex < this.#primaryQueue.length + this.#secondaryQueue.length) {
      if (this.#secondaryQueue.length - this.#secondaryIndex > this.#primaryQueue.length - this.#primaryIndex) {
        this.#mergeQueues();
        continue;
      }

      const nextString = this.#nextValue();
      if (nextString === undefined) {
        break;
      }
      if (this.#deletedItems.has(nextString))
        continue;

      this.#visitedItems.add(nextString);
      yield nextString;
    }
  }

  #mergeQueues(): void {
    if (this.#primaryQueue.length === this.#primaryIndex) {
      // not going to worry about this.#deletedItems...
      this.#primaryQueue = this.#secondaryQueue.slice(this.#secondaryIndex);
    } else {
      const newQueue: string[] = [];
      newQueue.length = this.#primaryQueue.length + this.#secondaryQueue.length - this.#primaryIndex - this.#secondaryIndex;
      let newCount = 0;

      while (this.#primaryIndex + this.#secondaryIndex < this.#primaryQueue.length + this.#secondaryQueue.length) {
        const nextString = this.#nextValue();
        if (this.#deletedItems.has(nextString)) {
          continue;
        }
        newQueue[newCount] = nextString;
        newCount++;
      }

      newQueue.length = newCount;
      this.#primaryQueue = newQueue;
    }

    this.#primaryIndex = 0;
    this.#secondaryQueue = [];
    this.#secondaryIndex = 0;
  }

  #nextValue(): string {
    const nextPrimary = this.#primaryQueue[this.#primaryIndex];
    const nextSecondary = this.#secondaryQueue[this.#secondaryIndex];

    const usePrimary = OrderedStringIterator.#stringOrUndefinedComparator(nextPrimary, nextSecondary) < 1;
    if (usePrimary) {
      this.#primaryIndex++;
      return nextPrimary;
    }

    this.#secondaryIndex++;
    return nextSecondary;
  }
}
