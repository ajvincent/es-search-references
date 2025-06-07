import {
  JSONStorage
} from "./JSONStorage.js";

import {
  OrderedKeyMap
} from "../utilities/OrderedKeyMap.js";

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

  static #getParentAndLeaf(key: string): [string, string] {
    let lastSlash = key.lastIndexOf("/");
    if (lastSlash === -1) {
      return ["", key];
    }
    const parent = key.substring(0, lastSlash);
    const leaf = key.substring(lastSlash + 1);
    return [parent, leaf];
  }

  static #defineFile(
    topObject: ExportedDirectories,
    map: Map<string, ExportedDirectories>,
    pathToFile: string,
    contents: string
  ): void
  {
    const [parent, leaf] = FileSystemMap.#getParentAndLeaf(pathToFile);
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

    const [parent, leaf] = FileSystemMap.#getParentAndLeaf(pathToDirectory);
    if (parent) {
      const dictionary = FileSystemMap.#requireDirectory(topObject, map, parent);
      dictionary[leaf] = dir;
    } else {
      topObject[leaf] = dir;
    }

    return dir;
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
}
