import {
  AwaitedMap
} from "../utilities/AwaitedMap.js";

import type {
  FSManagerInternalIfc
} from "./types/FileSystemManagerIfc.js";

import type {
  WebFileSystemIfc
} from "./types/WebFileSystemIfc.js";

/** @internal */
export class WebFileSystem implements WebFileSystemIfc {
  static #fileComparator(a: readonly [string, string], b: readonly [string, string]): number {
    return a[0].localeCompare(b[0]);
  }

  readonly #key: string;
  #description: string;
  readonly #fsManager: FSManagerInternalIfc;

  // WebFileSystemIfc
  readonly packagesDir: FileSystemDirectoryHandle;

  // WebFileSystemIfc
  readonly urlsDir: Omit<FileSystemDirectoryHandle, "getFileHandle">;

  constructor(
    key: string,
    description: string,
    packagesDir: FileSystemDirectoryHandle,
    urlsDir: FileSystemDirectoryHandle,
    fsManager: FSManagerInternalIfc,
  )
  {
    this.#key = key;
    this.#description = description;
    this.packagesDir = packagesDir;
    this.urlsDir = urlsDir;
    this.#fsManager = fsManager;
  }

  // WebFileSystemIfc
  get description(): string {
    return this.#description;
  }

  // WebFileSystemIfc
  async setDescription(newDesc: string): Promise<void> {
    await this.#fsManager.setDescription(this.#key, newDesc);
    this.#description = newDesc;
  }

  // WebFileSystemIfc
  async getWebFilesMap(): Promise<ReadonlyMap<string, string>>
  {
    const packagesMap = new AwaitedMap<string, string>;
    const urlsMap = new AwaitedMap<string, string>;
    await Promise.all([
      this.#fillFileMaps("", packagesMap, this.packagesDir),
      this.#fillFileMaps("", urlsMap, this.urlsDir),
    ]);

    const [
      resolvedPackages, resolvedURLs
    ] = await Promise.all([
      packagesMap.allResolved(),
      urlsMap.allResolved(),
    ]);

    const packageEntries: (readonly [string, string])[] = Array.from(resolvedPackages.entries());
    packageEntries.sort(WebFileSystem.#fileComparator);

    const urlEntries: (readonly [string, string])[] = Array.from(resolvedURLs.entries());
    urlEntries.sort(WebFileSystem.#fileComparator);

    return new Map([...packageEntries, ...urlEntries]);
  }

  async #fillFileMaps(
    prefix: string,
    pendingFileMap: Map<string, Promise<string>>,
    currentDirectory: Omit<FileSystemDirectoryHandle, "getFileHandle">,
  ): Promise<void>
  {
    const entries: [string, FileSystemHandle][] = await Array.fromAsync(currentDirectory.entries());
    const promiseArray: Promise<unknown>[] = [];

    for (let [pathToFile, handle] of entries) {
      if (currentDirectory === this.urlsDir) {
        pathToFile += ":/";
      } else if (currentDirectory !== this.packagesDir) {
        pathToFile = prefix + "/" + pathToFile;
      }

      if (handle instanceof FileSystemFileHandle) {
        const promise = handle.getFile().then(file => file.text());
        promiseArray.push(promise);
        pendingFileMap.set(pathToFile, promise);
      } else if (handle instanceof FileSystemDirectoryHandle) {
        promiseArray.push(this.#fillFileMaps(pathToFile, pendingFileMap, handle));
      } else {
        throw new Error("path is neither a file nor a directory?  How?  " + pathToFile);
      }
    }

    await Promise.all(promiseArray);
  }

  // WebFileSystemIfc
  async remove(): Promise<void> {
    return this.#fsManager.remove(this.#key);
  }
}
