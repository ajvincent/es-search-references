import { dir } from "console";
import {
  AwaitedMap
} from "../../utilities/AwaitedMap.js";
import { FileSystemClipboardIfc } from "../types/FileSystemClipboardIfc.js";

import type {
  DirectoryRecord,
  OPFSWebFileSystemIfc,
  TopDirectoryRecord,
} from "../types/WebFileSystemIfc.js";

import {
  DirectoryWorker,
  GET_ROOT_DIR_METHOD,
  SEARCH_PARAMS
} from "./DirectoryWorker.js";

import {
  FileSystemClipboard
} from "./FileSystemClipboard.js";

import {
  FileSystemUtilities
} from "./FSUtilities.js";

import {
  URLDirHandle
} from "./URLDirHandle.js";

const WorkerGlobal = self as unknown as DedicatedWorkerGlobalScope;

export class OPFSWebFileSystemWorker
extends DirectoryWorker<OPFSWebFileSystemIfc>
implements OPFSWebFileSystemIfc
{
  static async build(): Promise<void> {
    const topDir = await DirectoryWorker[GET_ROOT_DIR_METHOD]();
    const [packagesDir, urlsDir] = await Promise.all([
      topDir.getDirectoryHandle("packages", { create: true }),
      topDir.getDirectoryHandle("urls", { create: true })
    ]);

    let rootDir = await WorkerGlobal.navigator.storage.getDirectory();
    const clipboardDir = await this.#getDirectoryDeep(
      rootDir,
      this[SEARCH_PARAMS].get("pathToClipboardDir")!.split("/"),
      true
    );
    const clipboard = new FileSystemClipboard(clipboardDir);

    void(new OPFSWebFileSystemWorker(packagesDir, new URLDirHandle(urlsDir), clipboard));
    WorkerGlobal.postMessage("initialized");
  }

  static #getPathSequence(
    pathToEntry: string
  ): string[]
  {
    if (URL.canParse(pathToEntry)) {
      const {protocol, hostname, pathname} = URL.parse(pathToEntry)!;
      return [protocol + "//", hostname, ...pathname.substring(1).split("/")].filter(Boolean);
    }

    return pathToEntry.split("/");
  }

  static async #getDirectoryDeep(
    currentDir: FileSystemDirectoryHandle,
    pathSequence: readonly string[],
    create: boolean
  ): Promise<FileSystemDirectoryHandle>
  {
    const options = { create };
    for (const part of pathSequence) {
      currentDir = await currentDir.getDirectoryHandle(part, options);
    }
    return currentDir;
  }

  static #fileEntryComparator(
    a: [string, FileSystemHandle], b: [string, FileSystemHandle]
  ): number
  {
    return a[0].localeCompare(b[0]);
  }

  readonly #packagesDir: FileSystemDirectoryHandle;
  readonly #urlsDir: URLDirHandle;
  readonly #clipboard: FileSystemClipboardIfc;

  private constructor(
    packagesDir: FileSystemDirectoryHandle,
    urlsDir: URLDirHandle,
    clipboard: FileSystemClipboardIfc
  )
  {
    super();
    this.#packagesDir = packagesDir;
    this.#urlsDir = urlsDir;
    this.#clipboard = clipboard;
  }

  // OPFSWebFileSystemIfc
  async getWebFilesRecord(): Promise<{ [key: string]: string; }> {
    const entries: [string, string][] = [];
    async function callback(
      pathToEntry: string,
      entry: FileSystemDirectoryHandle | FileSystemFileHandle
    ): Promise<void>
    {
      if (entry.kind === "file")
        entries.push([pathToEntry, await FileSystemUtilities.readFile(entry)]);
    }

    await FileSystemUtilities.directoryTraversal("", true, this.#packagesDir, callback);
    for await (const [protocol, dirEntry] of this.#urlsDir.entries()) {
      await FileSystemUtilities.directoryTraversal(protocol, true, dirEntry as FileSystemDirectoryHandle, callback);
    }

    return Promise.resolve(Object.fromEntries(entries));
  }

  // OPFSWebFileSystemIfc
  async importDirectoryRecord(
    dirRecord: TopDirectoryRecord
  ): Promise<void>
  {
    let promisesSet = new Set<Promise<void>>;
    promisesSet.add(this.#addRecordsRecursive(this.#packagesDir, dirRecord.packages, ""));
    promisesSet.add(this.#addRecordsRecursive(this.#urlsDir.rawDirectory, dirRecord.urls, ""));

    await Promise.all(promisesSet);
  }

  async #addRecordsRecursive(
    currentDir: FileSystemDirectoryHandle,
    dirRecord: DirectoryRecord,
    pathToEntry: string,
  ): Promise<void>
  {
    const promises = new Set<Promise<void>>;
    for (const [key, stringOrDir] of Object.entries(dirRecord)) {
      const childPath = pathToEntry ? pathToEntry + "/" + key : key;
      if (typeof stringOrDir === "string") {
        promises.add(this.#addFileShallow(currentDir, key, stringOrDir));
      }
      else {
        promises.add(this.#addDirectoryRecursive(currentDir, key, stringOrDir, childPath));
      }
    }

    await Promise.all(promises);
  }

  async #addDirectoryRecursive(
    currentDir: FileSystemDirectoryHandle,
    childDirName: string,
    childDirRecord: DirectoryRecord,
    pathToEntry: string
  ): Promise<void>
  {
    const childDir = await currentDir.getDirectoryHandle(
      childDirName, { create: true }
    );
    await this.#addRecordsRecursive(childDir, childDirRecord, pathToEntry);
  }

  async #addFileShallow(
    currentDir: FileSystemDirectoryHandle,
    fileLeafName: string,
    contents: string,
  ): Promise<void>
  {
    const fileHandle = await currentDir.getFileHandle(fileLeafName, { create: true });
    await FileSystemUtilities.writeFile(fileHandle, contents);
  }

  // OPFSWebFileSystemIfc
  async exportDirectoryRecord(): Promise<TopDirectoryRecord> {
    const [
      packages, urlsRaw
    ] = await Promise.all([
      this.#exportDirectoryRecordRecursive(this.#packagesDir, true),
      this.#exportDirectoryRecordRecursive(this.#urlsDir.rawDirectory, true)
    ]);
    const urls = urlsRaw as { [key: string]: DirectoryRecord };
    return { packages, urls };
  }

  async #exportDirectoryRecordRecursive(
    dirHandle: FileSystemDirectoryHandle,
    readFiles: boolean
  ): Promise<DirectoryRecord>
  {
    const fileEntries: [string, FileSystemHandle][] = await Array.fromAsync(dirHandle.entries());
    fileEntries.sort(OPFSWebFileSystemWorker.#fileEntryComparator);

    const map = new AwaitedMap<string, DirectoryRecord | string>;
    for (const [leafName, entry] of fileEntries) {
      if (entry.kind === "directory")
        map.set(leafName, this.#exportDirectoryRecordRecursive(entry as FileSystemDirectoryHandle, readFiles));
      else if (readFiles)
        map.set(leafName, FileSystemUtilities.readFile(entry as FileSystemFileHandle));
      else
        map.set(leafName, Promise.resolve(""));
    }

    return Object.fromEntries(await map.allResolved());
  }

  // OPFSWebFileSystemIfc
  async getIndex(): Promise<DirectoryRecord> {
    const [packageIndex, urlsIndex] = await Promise.all([
      this.#exportDirectoryRecordRecursive(this.#packagesDir, false),
      this.#exportDirectoryRecordRecursive(this.#urlsDir, false)
    ]);

    for (const [key, entry] of Object.entries(urlsIndex)) {
      packageIndex[key] = entry;
    }

    return packageIndex;
  }

  // OPFSWebFileSystemIfc
  async createDirDeep(
    pathToDir: string
  ): Promise<void>
  {
    const pathSequence = OPFSWebFileSystemWorker.#getPathSequence(pathToDir);
    await OPFSWebFileSystemWorker.#getDirectoryDeep(
      URL.canParse(pathToDir) ? this.#urlsDir : this.#packagesDir,
      pathSequence,
      true
    );
  }

  // OPFSWebFileSystemIfc
  async readFileDeep(
    pathToFile: string
  ): Promise<string>
  {
    const fileHandle = await this.#getFileDeep(pathToFile, false);
    return FileSystemUtilities.readFile(fileHandle);
  }

  // OPFSWebFileSystemIfc
  async writeFileDeep(
    pathToFile: string,
    contents: string
  ): Promise<void>
  {
    const fileHandle = await this.#getFileDeep(pathToFile, true);
    return FileSystemUtilities.writeFile(fileHandle, contents);
  }

  async #getFileDeep(
    pathToFile: string,
    create: boolean
  ): Promise<FileSystemFileHandle>
  {
    const pathSequence = OPFSWebFileSystemWorker.#getPathSequence(pathToFile);
    const leafName = pathSequence.pop()!;

    const dirHandle = await OPFSWebFileSystemWorker.#getDirectoryDeep(
      URL.canParse(pathToFile) ? this.#urlsDir : this.#packagesDir,
      pathSequence,
      create
    );

    return await dirHandle.getFileHandle(leafName, { create });
  }

  // OPFSWebFileSystemIfc
  async removeEntryDeep(pathToEntry: string): Promise<void> {
    const pathSequence = OPFSWebFileSystemWorker.#getPathSequence(pathToEntry);
    const leafName = pathSequence.pop()!;

    const dirHandle = await OPFSWebFileSystemWorker.#getDirectoryDeep(
      URL.canParse(pathToEntry) ? this.#urlsDir : this.#packagesDir,
      pathSequence,
      false
    );

    return dirHandle.removeEntry(leafName, { recursive: true });
  }

  // OPFSWebFileSystemIfc
  async getClipboardIndex(): Promise<DirectoryRecord> {
    const clipboardDir: FileSystemDirectoryHandle | null = await this.#clipboard.getCurrent();
    if (clipboardDir)
      return this.#exportDirectoryRecordRecursive(clipboardDir, false);

    return {};
  }

  // OPFSWebFileSystemIfc
  async copyFromClipboard(pathToDir: string): Promise<void> {
    const pathSequence = OPFSWebFileSystemWorker.#getPathSequence(pathToDir);
    const dirHandle = await OPFSWebFileSystemWorker.#getDirectoryDeep(
      URL.canParse(pathToDir) ? this.#urlsDir : this.#packagesDir,
      pathSequence,
      false
    );

    if (dirHandle === this.#urlsDir)
      return this.#clipboard.copyTo(this.#urlsDir.rawDirectory);

    return this.#clipboard.copyTo(dirHandle);
  }

  // OPFSWebFileSystemIfc
  async copyToClipboard(pathToEntry: string): Promise<void> {
    const pathSequence = OPFSWebFileSystemWorker.#getPathSequence(pathToEntry);
    const leafName = pathSequence.pop()!;

    const dirHandle = await OPFSWebFileSystemWorker.#getDirectoryDeep(
      URL.canParse(pathToEntry) ? this.#urlsDir : this.#packagesDir,
      pathSequence,
      false
    );

    if (dirHandle === this.#urlsDir)
      return this.#clipboard.copyFrom(this.#urlsDir.rawDirectory, leafName.substring(0, leafName.length - 3));

    return this.#clipboard.copyFrom(dirHandle, leafName);
  }

  async readClipboardFile(
    pathToFile: string
  ): Promise<string>
  {
    const pathSequence = OPFSWebFileSystemWorker.#getPathSequence(pathToFile);
    const leafName = pathSequence.pop()!;

    const clipboardDir = (await this.#clipboard.getCurrent());
    if (!clipboardDir)
      throw new Error("no clipboard directory found");

    const dirHandle = await OPFSWebFileSystemWorker.#getDirectoryDeep(
      clipboardDir,
      pathSequence,
      false
    );

    const fileHandle = await dirHandle.getFileHandle(leafName, { create: false });
    return FileSystemUtilities.readFile(fileHandle);
  }

  // OPFSWebFileSystemIfc
  clearClipboard(): Promise<void> {
    return this.#clipboard.clear();
  }

  // OPFSWebFileSystemIfc
  terminate(): Promise<void> {
    return Promise.resolve();
  }
}

await OPFSWebFileSystemWorker.build();
