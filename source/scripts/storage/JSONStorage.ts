import type {
  Jsonifiable
} from "type-fest";

export class JSONStorage {
  readonly #storage: Storage;
  readonly #rootStorageKey: string;
  readonly #internalMap: Map<string, Jsonifiable>;

  constructor(storage: Storage, root: string) {
    this.#storage = storage;
    this.#rootStorageKey = root;

    const localItems = this.#storage.getItem(root);
    if (localItems) {
      const localMap = JSON.parse(localItems);
      this.#internalMap = new Map(localMap);
    } else {
      this.#internalMap = new Map;
    }
  }

  get length(): number {
    return this.#internalMap.size;
  };

  clear(): void {
    this.#internalMap.clear();
    this.#storage.removeItem(this.#rootStorageKey);
  }

  getItem(key: string): Jsonifiable | null {
    return this.#internalMap.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.#internalMap.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.#internalMap.delete(key);
    if (this.#internalMap.size === 0) {
      this.#storage.removeItem(this.#rootStorageKey);
    } else {
      this.#storage.setItem(this.#rootStorageKey, JSON.stringify(Array.from(this.#internalMap)));
    }
  }

  setItem(key: string, value: Jsonifiable): void {
    this.#internalMap.set(key, value);
    this.#storage.setItem(this.#rootStorageKey, JSON.stringify(Array.from(this.#internalMap)));
  }

  allKeys(): string[] {
    return Array.from(this.#internalMap.keys());
  }
}
