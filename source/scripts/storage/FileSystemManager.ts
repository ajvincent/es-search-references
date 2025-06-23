import type {
  UnzipCallback,
  UnzipFileFilter
} from "fflate";

import {
  unzip,
} from "../../lib/packages/fflate.js";

import {
  AsyncJSONMap
} from "./AsyncJSONMap.js";

import {
  FileSystemClipboard
} from "./FileSystemClipboard.js";

import {
  WebFileSystem
} from "./WebFileSystem.js";

import type {
  FileSystemClipboardIfc
} from "./types/FileSystemClipboardIfc.js";

import type {
  FileSystemManagerIfc,
  FSManagerInternalIfc,
} from "./types/FileSystemManagerIfc.js";

import type {
  WebFileSystemIfc
} from "./types/WebFileSystemIfc.js";

export class FileSystemManager
implements FileSystemManagerIfc, FSManagerInternalIfc
{
  static async build(
    topDir: FileSystemDirectoryHandle
  ): Promise<FileSystemManagerIfc>
  {
    const systemsDir: FileSystemDirectoryHandle = await topDir.getDirectoryHandle("filesystems", { create: true });
    const indexFile: FileSystemFileHandle = await topDir.getFileHandle("index.json", { create: true });
    const indexMap: AsyncJSONMap<string> = await AsyncJSONMap.build(indexFile);
    const clipboardDir: FileSystemDirectoryHandle = await topDir.getDirectoryHandle("clipboard", { create: true });
    const clipboard = new FileSystemClipboard(clipboardDir);

    return new FileSystemManager(systemsDir, indexMap, clipboard);
  }

  static readonly #decoder = new TextDecoder();

  readonly #systemsDir: FileSystemDirectoryHandle;
  readonly #indexMap: AsyncJSONMap<string>;
  readonly #descriptionsSet: Set<string>;

  readonly #cache = new Map<string, Promise<WebFileSystemIfc>>;

  readonly clipboard: FileSystemClipboardIfc;

  private constructor(
    systemsDir: FileSystemDirectoryHandle,
    indexMap: AsyncJSONMap<string>,
    clipboard: FileSystemClipboardIfc,
  )
  {
    this.#systemsDir = systemsDir;
    this.#indexMap = indexMap;
    this.#descriptionsSet = new Set(indexMap.values());

    this.clipboard = clipboard;
  }

  // FileSystemManagerIfc
  get availableSystems(): ReadonlyMap<string, string> {
    return this.#indexMap;
  }

  // FileSystemManagerIfc
  buildEmpty(
    description: string
  ): Promise<WebFileSystemIfc>
  {
    if (this.#descriptionsSet.has(description))
      return Promise.reject(new Error("duplicate description: " + description));

    const key = window.crypto.randomUUID();
    const promise: Promise<WebFileSystemIfc> = this.#createManager(key, description, true);
    this.#cache.set(key, promise);
    return this.setDescription(key, description).then(() => promise);
  }

  // FileSystemManagerIfc
  getExisting(
    key: string
  ): Promise<WebFileSystemIfc>
  {
    if (this.#cache.has(key)) {
      return this.#cache.get(key)!;
    }

    const description = this.#indexMap.get(key);
    if (description === undefined)
      return Promise.reject(new Error("unknown key: " + key));
    const promise = this.#createManager(key, description, true);
    this.#cache.set(key, promise);
    return promise;
  }

  async importFromZip(
    description: string,
    zipFile: File
  ): Promise<WebFileSystemIfc>
  {
    const webFS = await this.buildEmpty(description);
    const map = await this.#extractFilesFromZip(zipFile);
    await webFS.importFilesMap(map);
    return webFS;
  }

  async #extractFilesFromZip(
    zipFile: File
  ): Promise<ReadonlyMap<`packages/${string}` | `urls/${string}`, string>>
  {
    const byteArray: Uint8Array = await zipFile.bytes();

    const deferred = Promise.withResolvers<Record<string, Uint8Array>>();
    const filter: UnzipFileFilter = file => {
      return file.size > 0;
    }
    const resultFn: UnzipCallback = (err, unzipped) => {
      if (err)
        deferred.reject(err);
      else
        deferred.resolve(unzipped);
    };
    unzip(byteArray, { filter }, resultFn);
    const fileRecords: Record<string, Uint8Array> = await deferred.promise;

    const map = new Map<`packages/${string}` | `urls/${string}`, string>;
    for (const [pathToFile, fileBytes] of Object.entries(fileRecords)) {
      if (pathToFile.startsWith("packages/") === false && pathToFile.startsWith("urls/") === false)
        continue;
      map.set(
        pathToFile as `packages/${string}` | `urls/${string}`,
        FileSystemManager.#decoder.decode(fileBytes)
      );
    }

    return map;
  }

  async #createManager(
    key: string,
    description: string,
    create: boolean
  ): Promise<WebFileSystemIfc>
  {
    const webFilesDir = await this.#systemsDir.getDirectoryHandle(key, { create });
    const packagesPromise = webFilesDir.getDirectoryHandle("packages", { create });
    const urlsPromise = webFilesDir.getDirectoryHandle("urls", { create });

    const [packagesDir, urlsDir] = await Promise.all([packagesPromise, urlsPromise]);

    return new WebFileSystem(
      key, description, packagesDir, urlsDir, this
    );
  }

  // FSManagerInternalIfc
  async setDescription(
    key: string,
    newDescription: string
  ): Promise<void>
  {
    const oldDescription = this.#indexMap.get(key);
    if (typeof oldDescription !== "undefined")
      this.#descriptionsSet.delete(oldDescription);

    this.#indexMap.set(key, newDescription);
    await this.#indexMap.commit();
    this.#descriptionsSet.add(newDescription);
  }

  // FSManagerInternalIfc
  async remove(
    key: string
  ): Promise<void>
  {
    if (!this.#indexMap.has(key))
      throw new Error("key not found: " + key);
    const description = this.#indexMap.get(key)!;
    this.#descriptionsSet.delete(description);
    this.#indexMap.delete(key);
    this.#cache.delete(key);

    await this.#indexMap.commit();
    await this.#systemsDir.removeEntry(key, { recursive: true });
  }
}
