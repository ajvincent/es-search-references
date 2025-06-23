import {
  FlateCallback,
  zip
} from "../../lib/packages/fflate.js";

import {
  AwaitedMap
} from "../utilities/AwaitedMap.js";

import  type {
  FileSystemClipboardIfc
} from "./types/FileSystemClipboardIfc.js";

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

  static readonly #encoder = new TextEncoder();
  static #createZipEntry(keyAndContents: readonly [string, string]): [string, Uint8Array] {
    const [key, contents] = keyAndContents;
    return [key, WebFileSystem.#encoder.encode(contents)];
  }

  static readonly #pathHeadRE = /^([^\/]+)\//;

  readonly #key: string;
  #description: string;
  readonly #fsManager: FSManagerInternalIfc;

  // WebFileSystemIfc
  readonly packagesDir: FileSystemDirectoryHandle;

  // WebFileSystemIfc
  readonly urlsDir: FileSystemDirectoryHandle;

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
      this.#fillFileMap("", packagesMap, this.packagesDir, false),
      this.#fillFileMap("", urlsMap, this.urlsDir, false),
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

  async exportAsZip(): Promise<File> {
    const pendingFilesMap = new AwaitedMap<`packages/${string}` | `urls/${string}`, string>;
    await Promise.all([
      this.#fillFileMap("packages", pendingFilesMap, this.packagesDir, true),
      this.#fillFileMap("urls", pendingFilesMap, this.urlsDir, true)
    ]);

    const fileMap = await pendingFilesMap.allResolved();
    const fileEntries: [`packages/${string}` | `urls/${string}`, string][] = Array.from(fileMap.entries());
    fileEntries.sort(WebFileSystem.#fileComparator);

    const zipEntries: [string, Uint8Array][] = fileEntries.map(WebFileSystem.#createZipEntry);

    const deferred = Promise.withResolvers<Uint8Array<ArrayBufferLike>>();
    const resultFn: FlateCallback = (err, zipped) => {
      if (err)
        deferred.reject(err);
      else
        deferred.resolve(zipped);
    }
    zip(Object.fromEntries(zipEntries), resultFn);

    const zipUint8: Uint8Array<ArrayBufferLike> = await deferred.promise;
    return new File([zipUint8], "exported-files.zip", { type: "application/zip" });
  }

  async #fillFileMap(
    prefix: string,
    pendingFileMap: Map<string, Promise<string>>,
    currentDirectory: Omit<FileSystemDirectoryHandle, "getFileHandle">,
    mustJoinDirs: boolean,
  ): Promise<void>
  {
    const entries: [string, FileSystemHandle][] = await Array.fromAsync(currentDirectory.entries());
    const promiseArray: Promise<unknown>[] = [];

    for (let [pathToFile, handle] of entries) {
      if (mustJoinDirs || (currentDirectory !== this.urlsDir && currentDirectory !== this.packagesDir)) {
        pathToFile = prefix + "/" + pathToFile;
      } else if (currentDirectory === this.urlsDir) {
        pathToFile += ":/";
      }

      if (handle instanceof FileSystemFileHandle) {
        const promise = handle.getFile().then(file => file.text());
        promiseArray.push(promise);
        pendingFileMap.set(pathToFile, promise);
      } else if (handle instanceof FileSystemDirectoryHandle) {
        promiseArray.push(this.#fillFileMap(pathToFile, pendingFileMap, handle, true));
      } else {
        throw new Error("path is neither a file nor a directory?  How?  " + pathToFile);
      }
    }

    await Promise.all(promiseArray);
  }

  async importFilesMap(
    map: ReadonlyMap<`packages/${string}` | `urls/${string}`, string>
  ): Promise<void>
  {
    const pendingDirsMap = new AwaitedMap<string, FileSystemDirectoryHandle>([
      ["packages", Promise.resolve(this.packagesDir)],
      ["urls", Promise.resolve(this.urlsDir)]
    ]);

    const filePromises = new Set<Promise<void>>;

    for (const [filePath, contents] of map) {
      const fileParts: string[] = filePath.split("/");
      let sequence: string = fileParts.shift()!;
      if (sequence !== "packages" && sequence !== "urls")
        continue;

      const leafName: string = fileParts.pop()!;
      for (const part of fileParts) {
        sequence = this.#requireChildDirPromise(pendingDirsMap, sequence, part);
      }

      filePromises.add(
        this.#requireChildFilePromise(pendingDirsMap, sequence, leafName, contents)
      );
    }

    await Promise.all(filePromises);
  }

  #requireChildDirPromise(
    pendingDirsMap: AwaitedMap<string, FileSystemDirectoryHandle>,
    parentSequence: string,
    nextPart: string
  ): string
  {
    const nextSequence = parentSequence + "/" + nextPart;

    if (!pendingDirsMap.has(nextSequence)) {
      const dirPromise: Promise<FileSystemDirectoryHandle> = pendingDirsMap.get(parentSequence)!;
      pendingDirsMap.set(
        nextSequence,
        dirPromise.then(dirHandle => dirHandle.getDirectoryHandle(nextPart, { create: true }))
      );
    }

    return nextSequence;
  }

  async #requireChildFilePromise(
    pendingDirsMap: AwaitedMap<string, FileSystemDirectoryHandle>,
    parentSequence: string,
    name: string,
    contents: string
  ): Promise<void>
  {
    const dirHandle: FileSystemDirectoryHandle = await pendingDirsMap.get(parentSequence)!;
    const fileHandle: FileSystemFileHandle = await dirHandle.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  }

  // WebFileSystemIfc
  async remove(): Promise<void> {
    return this.#fsManager.remove(this.#key);
  }

  // WebFileSystemIfc
  get clipboard(): FileSystemClipboardIfc {
    return this.#fsManager.clipboard;
  }
}
