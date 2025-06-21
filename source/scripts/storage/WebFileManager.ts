import {
  AwaitedMap
} from "../utilities/AwaitedMap.js";

import type {
  WebFileManagerIfc
} from "./types/WebFileManager.js";

let SearchFilesTopDir: FileSystemDirectoryHandle;

{
  const rootDir = await navigator.storage.getDirectory();
  SearchFilesTopDir = await rootDir.getDirectoryHandle("es-search-references", { create: true });
}

/** @internal */
//FIXME: create AsyncMap and AsyncSet interfaces for this, so the map can be live.
class IndexManagerClass {
  readonly #idToDescriptionMap: Map<string, string>;
  readonly #descriptionValues: Set<string>;
  readonly #fileHandle: FileSystemFileHandle;

  readonly idToDescriptionMap: ReadonlyMap<string, string>;
  readonly descriptionValues: ReadonlySet<string>;

  constructor(
    entries: [string, string][],
    fileHandle: FileSystemFileHandle,
  )
  {
    this.#idToDescriptionMap = new Map(entries);
    this.idToDescriptionMap = this.#idToDescriptionMap;

    this.#descriptionValues = new Set(this.#idToDescriptionMap.values());
    this.descriptionValues = this.#descriptionValues;

    this.#fileHandle = fileHandle;
  }

  async set(key: string, description: string): Promise<void> {
    const oldDescription = this.#idToDescriptionMap.get(key);
    if (typeof oldDescription !== "undefined") {
      this.#descriptionValues.delete(oldDescription);
    }

    this.#idToDescriptionMap.set(key, description);
    this.#descriptionValues.add(description);
    await this.#writeMap();
  }

  async delete(key: string): Promise<boolean> {
    const description = this.#idToDescriptionMap.get(key);
    if (typeof description === "undefined") {
      return false;
    }

    this.#idToDescriptionMap.delete(key);
    this.#descriptionValues.delete(description);
    await this.#writeMap();
    return true;
  }

  async #writeMap(): Promise<void> {
    const writable = await this.#fileHandle.createWritable();
    await writable.write(JSON.stringify(Array.from(this.#idToDescriptionMap)));
    await writable.close();
  }
}

const IndexManager: IndexManagerClass = await SearchFilesTopDir.getFileHandle(
  "index.json", { create: true }
).then(async fileHandle => {
  const file = await fileHandle.getFile();
  const text = await file.text();
  const entries = JSON.parse(text ?? "[]") as [string, string][];
  return new IndexManagerClass(entries, fileHandle);
});

export class WebFileManager implements WebFileManagerIfc {
  static #cache = new AwaitedMap<string, WebFileManagerIfc>;

  /** this is so clients know what file systems they have available */
  static readonly definedFileSystems: ReadonlyMap<string, string> = IndexManager.idToDescriptionMap;

  /** the known descriptions, so we don't reuse any */
  static readonly descriptions: ReadonlySet<string> = IndexManager.descriptionValues;

  /**
   * 
   * @param description - the description to use
   * @param key - reserved keys only here please... most of the time you don't want this
   * @returns 
   */
  static async buildEmpty(
    description: string,
    key?: string
  ): Promise<WebFileManagerIfc>
  {
    if (IndexManager.descriptionValues.has(description))
      throw new Error("duplicate description");

    key ??= window.crypto.randomUUID();
    const managerPromise = this.#createManager(key, description, true);
    const manager = await managerPromise;

    await IndexManager.set(key, description);
    this.#cache.set(key, managerPromise);
    return manager;
  }

  static getExisting(
    key: string
  ): Promise<WebFileManagerIfc>
  {
    if (!this.#cache.has(key)) {
      this.#cache.set(key, this.#reviveById(key));
    }
    return this.#cache.get(key)!;
  }

  static async #reviveById(
    key: string
  ): Promise<WebFileManagerIfc>
  {
    const description = IndexManager.idToDescriptionMap.get(key);
    if (!description) {
      throw new Error("no match for key: " + key);
    }

    return this.#createManager(key, description, false);
  }

  static async #createManager(
    key: string,
    description: string,
    create: boolean
  ): Promise<WebFileManagerIfc>
  {
    const webFilesDir = await SearchFilesTopDir.getDirectoryHandle(key, { create});
    const packagesPromise = webFilesDir.getDirectoryHandle("packages", { create });
    const urlsPromise = webFilesDir.getDirectoryHandle("urls", { create });

    const [packagesDir, urlsDir] = await Promise.all([packagesPromise, urlsPromise]);
    return new WebFileManager(key, description, packagesDir, urlsDir);
  }

  readonly #key: string;
  #description: string;

  readonly packagesDir: FileSystemDirectoryHandle;
  readonly urlsDir: FileSystemDirectoryHandle;

  get description(): string {
    return this.#description;
  }

  async setDescription(newDesc: string): Promise<void> {
    await IndexManager.set(this.#key, newDesc);
    this.#description = newDesc;
  }

  private constructor(
    key: string,
    description: string,
    packagesDir: FileSystemDirectoryHandle,
    urlsDir: FileSystemDirectoryHandle,
  )
  {
    this.#key = key;
    this.#description = description;
    this.packagesDir = packagesDir;
    this.urlsDir = urlsDir;
  }

  async getWebFilesMap(): Promise<ReadonlyMap<string, string>>
  {
    throw new Error("not yet implemented");
  }

  async remove(): Promise<void> {
    await WebFileManager.#cache.delete(this.#key);
    await IndexManager.delete(this.#key);
    await SearchFilesTopDir.removeEntry(this.#key, { recursive: true });
  }
}
