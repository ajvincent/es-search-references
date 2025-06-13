import {
  JSONStorage
} from "./JSONStorage.js";

import {
  OrderedKeyMap
} from "../utilities/OrderedKeyMap.js";

import {
  getParentAndLeaf
} from "../utilities/getParentAndLeaf.js";

export type ExportedFileSystem = Record<"packages" | "urls", ExportedDirectories>;

export type ExportedFileEntry = Uint8Array | ExportedDirectories;
export type ExportedDirectories = {[Key in string]: ExportedFileEntry};

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

  static readonly #encoder = new TextEncoder();

  static #defineFile(
    topObject: ExportedDirectories,
    map: Map<string, ExportedDirectories>,
    pathToFile: string,
    contents: string
  ): void
  {
    const [parent, leaf] = getParentAndLeaf(pathToFile);
    const byteArray = FileSystemMap.#encoder.encode(contents);
    if (parent) {
      const dir: ExportedDirectories = FileSystemMap.#requireDirectory(topObject, map, parent);
      dir[leaf] = byteArray;
    } else {
      topObject[leaf] = byteArray;
    }
  }

  static #requireDirectory(
    topObject: ExportedDirectories,
    map: Map<string, ExportedDirectories>,
    pathToDirectory: string
  ): ExportedDirectories
  {
    if (map.has(pathToDirectory))
      return map.get(pathToDirectory)!;

    const dir: ExportedDirectories = {};
    map.set(pathToDirectory, dir);

    const [parent, leaf] = getParentAndLeaf(pathToDirectory);
    if (parent) {
      const dictionary = FileSystemMap.#requireDirectory(topObject, map, parent);
      dictionary[leaf] = dir;
    } else {
      topObject[leaf] = dir;
    }

    return dir;
  }

  static #afterKeyComparator(a: string, b: string): number {
    if (a.startsWith(b))
      return -1;
    return a.localeCompare(b);
  }

  readonly systemKey: string;
  #isBatchUpdate = false;

  constructor(systemKey: string, entries: [string, string][]) {
    super(entries);
    this.systemKey = systemKey;
    this.#refreshStorage();
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

  set(key: string, value: string): this {
    super.set(key, value);
    if (!this.#isBatchUpdate)
      this.#refreshStorage();
    return this;
  }

  exportAsJSON(): ExportedFileSystem {
    const result: ExportedFileSystem = {
      packages: {},
      urls: {}
    };

    const packagesMap = new Map<string, ExportedDirectories>;
    const urlsMap = new Map<string, ExportedDirectories>;

    for (const [pathToFile, contents] of this.entries()) {
      let topObject: ExportedDirectories;
      let map: Map<string, ExportedDirectories>;
      let remainingPath: string;

      const url = URL.parse(pathToFile);

      if (url) {
        const head = url.protocol.substring(0, url.protocol.length - 1);
        topObject = result.urls;
        map = urlsMap;
        remainingPath = head + "/" + url.pathname.substring(1);
      } else {
        topObject = result.packages;
        map = packagesMap;
        remainingPath = pathToFile;
      }

      FileSystemMap.#defineFile(topObject, map, remainingPath, contents);
    }

    return result;
  }

  hasPath(parentPath: string): boolean {
    const index = this.getInsertionIndex(parentPath);
    return (index < this.keysArray.length && this.keysArray[index].startsWith(parentPath))
  }

  /*
  batchPaste(
    fromParentPath: string,
    toParentPath: string,
    entries: [string, string][]
  ): void
  {
    if (!fromParentPath.endsWith("/"))
      throw new Error("fromParentPath must end with a slash");
    if (!toParentPath.endsWith("/"))
      throw new Error("toParentPath must end with a slash");
    throw new Error("not yet implemented");
  }
  */

  batchRename(
    fromParentPath: string,
    toParentPath: string
  ): void
  {
    if (!fromParentPath.endsWith("/"))
      throw new Error("fromParentPath must end with a slash");
    if (!toParentPath.endsWith("/"))
      throw new Error("toParentPath must end with a slash");
    this.batchUpdate(() => this.#batchRename(fromParentPath, toParentPath));
  }

  batchDelete(
    parentPath: string
  ): void
  {
    if (!parentPath.endsWith("/"))
      throw new Error("parentPath must end with a slash");
    this.batchUpdate(() => this.#batchDelete(parentPath));
  }

  #batchRename(
    fromParentPath: string,
    toParentPath: string
  ): void
  {
    const startIndex = this.getInsertionIndex(fromParentPath);
    const endIndex = this.#getAfterKeyIndex(fromParentPath);

    const keysToDelete = this.keysArray.slice(startIndex, endIndex);
    const collectedEntries: [string, string][] = [];
    for (const key of keysToDelete) {
      collectedEntries.push([key.replace(fromParentPath, toParentPath), this.get(key)!]);
    }

    this.deleteByIndices(startIndex, endIndex)

    for (const [newPath, contents] of collectedEntries) {
      this.set(newPath, contents);
    }
  }

  #batchDelete(
    parentPath: string
  ): void
  {
    const startIndex = this.getInsertionIndex(parentPath);
    const endIndex = this.#getAfterKeyIndex(parentPath);
    this.deleteByIndices(startIndex, endIndex);
  }

  #getAfterKeyIndex(key: string): number {
    let min = 0, max = this.keysArray.length;
    while (min < max) {
      const mid = (min + max) >> 1;
      const currentKey = this.keysArray[mid];
      if (FileSystemMap.#afterKeyComparator(currentKey, key) < 0) {
        min = mid + 1;
      } else {
        max = mid;
      }
    }

    return min;
  }
}
