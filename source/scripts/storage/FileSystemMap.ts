import {
  JSONStorage
} from "./JSONStorage.js";

import {
  OrderedKeyMap
} from "../utilities/OrderedKeyMap.js";

export class FileSystemMap extends OrderedKeyMap<string> {
  static readonly #storage = new JSONStorage(window.localStorage, "es-search-references/files");
  static getAll(): OrderedKeyMap<FileSystemMap> {
    const entries: [string, FileSystemMap][] = [];
    for (const systemKey of this.#storage.allKeys()) {
      if (systemKey === "reference-spec-filesystem") {
        continue;
      }
      const items = this.#storage.getItem(systemKey) as [string, string][];
      entries.push([systemKey, new FileSystemMap(systemKey, items)]);
    }

    return new OrderedKeyMap(entries);
  }

  static allKeys(): readonly string[] {
    return FileSystemMap.#storage.allKeys();
  }

  readonly systemKey: string;
  #isBatchUpdate = false;

  constructor(systemKey: string, entries: [string, string][]) {
    super(entries);
    this.systemKey = systemKey;
    this.#refreshStorage();
    this.set = this.#set.bind(this);
  }

  clone(newSystemKey: string): FileSystemMap {
    const entries: [string, string][] = Array.from(this.entries());
    return new FileSystemMap(newSystemKey, entries);
  }

  #refreshStorage(): void {
    if (this.systemKey === "reference-spec-filesystem")
      return;
    if (this.size) {
      FileSystemMap.#storage.setItem(this.systemKey, Array.from(this.entries()));
    } else {
      FileSystemMap.#storage.removeItem(this.systemKey);
    }
  }

  batchUpdate(callback: () => void): void {
    this.#isBatchUpdate = true;
    try {
      super.batchUpdate(callback);
      this.#refreshStorage();
    }
    finally {
      this.#isBatchUpdate = false;
    }
  }

  clear(): void {
    super.clear();
    if (!this.#isBatchUpdate)
      this.#refreshStorage();
  }

  delete(key: string): boolean {
    const rv = super.delete(key);
    if (rv && !this.#isBatchUpdate) {
      this.#refreshStorage();
    }
    return rv;
  }

  #set(key: string, value: string): this {
    super.set(key, value);
    if (!this.#isBatchUpdate)
      this.#refreshStorage();
    return this;
  }
}
