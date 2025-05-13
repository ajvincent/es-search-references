import {
  JSONStorage
} from "./JSONStorage.js";

export class FileSystemMap extends Map<string, string> {
  static readonly #storage = new JSONStorage(window.localStorage, "es-search-references/files");
  static getAll(): Map<string, FileSystemMap> {
    const entries: [string, FileSystemMap][] = [];
    for (const systemKey of this.#storage.allKeys()) {
      const items = this.#storage.getItem(systemKey) as [string, string][];
      entries.push([systemKey, new FileSystemMap(systemKey, items)]);
    }

    return new Map(entries);
  }

  readonly #systemKey: string;
  constructor(systemKey: string, entries: [string, string][]) {
    super(entries);
    this.#systemKey = systemKey;
  }

  #refreshStorage(): void {
    if (this.size) {
      FileSystemMap.#storage.setItem(this.#systemKey, Array.from(this.entries()));
    } else {
      FileSystemMap.#storage.removeItem(this.#systemKey);
    }
  }

  clear(): void {
    super.clear();
    this.#refreshStorage();
  }

  delete(key: string): boolean {
    const rv = super.delete(key);
    if (rv) {
      this.#refreshStorage();
    }
    return rv;
  }

  set(key: string, value: string): this {
    super.set(key, value);
    this.#refreshStorage();
    return this;
  }
}
