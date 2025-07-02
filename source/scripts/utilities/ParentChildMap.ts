export class ParentChildMap<K, V> implements Map<K, V>
{
  readonly #internalMap = new Map<K, ParentChildNode<K, V>>;

  clear(): void {
    this.#internalMap.clear();
  }

  delete(
    key: K
  ): boolean
  {
    const node = this.#internalMap.get(key);
    if (!node)
      return false;

    if (node.parentKey) {
      this.#internalMap.get(node.parentKey)!.childKeys.delete(key);
    }
    this.#deleteRecursive(key);

    return true;
  }

  #deleteRecursive(
    key: K
  ): void
  {
    const node = this.#internalMap.get(key)!;
    for (const childKey of node.childKeys) {
      this.#deleteRecursive(childKey);
    }
    this.#internalMap.delete(key);
  }

  forEach(
    callbackfn: (
      value: V,
      key: K,
      map: Map<K, V>
    ) => void,
    thisArg?: any
  ): void
  {
    this.#internalMap.forEach((node, key) => {
      callbackfn.apply(thisArg, [node.value, key, this]);
    });
  }

  get(
    key: K
  ): V | undefined
  {
    return this.#internalMap.get(key)?.value;
  }

  has(
    key: K
  ): boolean
  {
    return this.#internalMap.has(key);
  }

  set(
    key: K,
    value: V,
    parentKey?: K
  ): this
  {
    const hadNode = this.#internalMap.has(key);
    if (hadNode) {
      if (parentKey !== undefined) {
        throw new Error("cannot set parent key for existing key: " + key);
      }
      this.#internalMap.get(key)!.value = value;
    }
    else {
      let ancestorKey: K | undefined = parentKey;
      while (ancestorKey) {
        if (ancestorKey === key) {
          throw new Error(`key ${key} is an ancestor of key ${parentKey}`);
        }
        ancestorKey = this.#internalMap.get(key)?.parentKey;
      }

      const node = new ParentChildNode<K, V>(value, parentKey);
      this.#internalMap.set(key, node);
    }

    return this;
  }

  get size(): number {
    return this.#internalMap.size;
  }

  entries(): MapIterator<[K, V]> {
    return this[Symbol.iterator]();
  }

  keys(): MapIterator<K> {
    return this.#internalMap.keys();
  }

  * values(): MapIterator<V> {
    for (const node of this.#internalMap.values()) {
      yield node.value;
    }
  }

  * [Symbol.iterator](): MapIterator<[K, V]> {
    for (const [key, node] of this.#internalMap) {
      yield [key, node.value];
    }
  }

  readonly [Symbol.toStringTag]: string = "ParentChildMap";
}

class ParentChildNode<K, V> {
  value: V;
  readonly parentKey?: K;
  readonly childKeys = new Set<K>;

  constructor(
    value: V,
    parentKey?: K
  )
  {
    this.value = value;
    this.parentKey = parentKey;
  }
}
