const MockSet: Set<unknown> = {
  add: function (value: unknown): Set<unknown> {
    throw new Error("Function not implemented.");
  },
  clear: function (): void {
    throw new Error("Function not implemented.");
  },
  delete: function (value: unknown): boolean {
    throw new Error("Function not implemented.");
  },
  forEach: function (callbackfn: (value: unknown, value2: unknown, set: Set<unknown>) => void, thisArg?: any): void {
    throw new Error("Function not implemented.");
  },
  has: function (value: unknown): boolean {
    throw new Error("Function not implemented.");
  },
  size: 0,
  entries: function (): SetIterator<[unknown, unknown]> {
    throw new Error("Function not implemented.");
  },
  keys: function (): SetIterator<unknown> {
    throw new Error("Function not implemented.");
  },
  values: function (): SetIterator<unknown> {
    throw new Error("Function not implemented.");
  },
  [Symbol.iterator]: function (): SetIterator<unknown> {
    throw new Error("Function not implemented.");
  },
  [Symbol.toStringTag]: "",
  union: function <U>(other: ReadonlySetLike<U>): Set<unknown> {
    throw new Error("Function not implemented.");
  },
  intersection: function <U>(other: ReadonlySetLike<U>): Set<U> {
    throw new Error("Function not implemented.");
  },
  difference: function <U>(other: ReadonlySetLike<U>): Set<unknown> {
    throw new Error("Function not implemented.");
  },
  symmetricDifference: function <U>(other: ReadonlySetLike<U>): Set<unknown> {
    throw new Error("Function not implemented.");
  },
  isSubsetOf: function (other: ReadonlySetLike<unknown>): boolean {
    throw new Error("Function not implemented.");
  },
  isSupersetOf: function (other: ReadonlySetLike<unknown>): boolean {
    throw new Error("Function not implemented.");
  },
  isDisjointFrom: function (other: ReadonlySetLike<unknown>): boolean {
    throw new Error("Function not implemented.");
  }
}

void(MockSet);
