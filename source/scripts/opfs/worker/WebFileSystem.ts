import { dir } from "console";
import {
  AwaitedMap
} from "../../utilities/AwaitedMap.js";

import type {
  DirectoryRecord,
  OPFSWebFileSystemIfc,
  TopDirectoryRecord,
  URLString
} from "../types/WebFileSystemIfc.js";

import {
  DirectoryWorker,
  GET_ROOT_DIR_METHOD
} from "./DirectoryWorker.js";

import {
  FileSystemUtilities
} from "./FSUtilities.js";

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

    const FSWorker = new OPFSWebFileSystemWorker(packagesDir, urlsDir);
    await FSWorker.fillSyncAccessMap();

    WorkerGlobal.postMessage("initialized");
  }

  readonly #packagesDir: FileSystemDirectoryHandle;
  readonly #urlsDir: FileSystemDirectoryHandle;

  readonly #syncAccessMap = new Map<string, FileSystemSyncAccessHandle>;

  private constructor(
    packagesDir: FileSystemDirectoryHandle,
    urlsDir: FileSystemDirectoryHandle
  )
  {
    super();
    this.#packagesDir = packagesDir;
    this.#urlsDir = urlsDir;
  }

  #resolvePathToEntry(
    pathToEntry: string,
  ): [FileSystemDirectoryHandle, string]
  {
    if (URL.canParse(pathToEntry)) {
      const topDir = this.#urlsDir;
      const {protocol, hostname, pathname} = URL.parse(pathToEntry)!;
      let fullPath = protocol.substring(0, protocol.length - 1);
      if (hostname)
        fullPath += "/" + hostname + pathname;
      return [topDir, fullPath];
    }

    return [this.#packagesDir, pathToEntry];
  }

  async #getDirectoryDeep(
    currentDir: FileSystemDirectoryHandle,
    pathToDir: string,
    create: boolean
  ): Promise<FileSystemDirectoryHandle>
  {
    const options = { create };
    for (const part of pathToDir.split("/")) {
      currentDir = await currentDir.getDirectoryHandle(part, options);
    }
    return currentDir;
  }

  async #requireSyncAccessHandle(
    pathToFile: string,
    fileHandle: FileSystemFileHandle
  ): Promise<FileSystemSyncAccessHandle>
  {
    if (!this.#syncAccessMap.has(pathToFile)) {
      this.#syncAccessMap.set(pathToFile, await fileHandle.createSyncAccessHandle());
    }
    return this.#syncAccessMap.get(pathToFile)!;
  }

  #closeAndDeleteSyncAccessHandle(
    pathToFile: string
  ): void
  {
    const fileHandle = this.#syncAccessMap.get(pathToFile);
    if (fileHandle) {
      fileHandle.close();
    }
    this.#syncAccessMap.delete(pathToFile);
  }

  protected async fillSyncAccessMap(): Promise<void> {
    const promisesSet = new Set<Promise<FileSystemSyncAccessHandle>>;
    const handleCallback = (
      pathToEntry: string,
      entry: FileSystemDirectoryHandle | FileSystemFileHandle
    ): void =>
    {
      if (entry.kind === "file") {
        promisesSet.add(this.#requireSyncAccessHandle(pathToEntry, entry));
      }
    }

    // This sequential await is intentional: packages come before urls.
    await FileSystemUtilities.directoryTraversal("", this.#packagesDir, handleCallback);
    await FileSystemUtilities.protocolTraversal(this.#urlsDir, handleCallback);

    await Promise.all(promisesSet);
  }

  async getWebFilesRecord(): Promise<{ [key: string]: string; }> {
    const entries: [string, string][] = [];
    for (const [pathToFile, syncAccessHandle] of this.#syncAccessMap) {
      entries.push([pathToFile, FileSystemUtilities.readContents(syncAccessHandle)]);
    }
    return Promise.resolve(Object.fromEntries(entries));
  }

  async importDirectoryRecord(dirRecord: TopDirectoryRecord): Promise<void> {
    let promisesSet = new Set<Promise<void>>;
    promisesSet.add(this.#addRecordsRecursive(this.#packagesDir, dirRecord.packages, ""));
    for (const [protocol, dirEntry] of Object.entries(dirRecord.urls)) {
      promisesSet.add(this.#addDirectoryRecursive(this.#urlsDir, protocol, dirEntry, protocol + "://"));
    }

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
      const childPath = key ? pathToEntry + "/" + key : key;
      if (typeof stringOrDir === "string") {
        promises.add(this.#addFileShallow(currentDir, key, stringOrDir, childPath));
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
    childPath: string
  ): Promise<void>
  {
    const fileHandle = await currentDir.getFileHandle(fileLeafName, { create: true });
    const syncAccessHandle = await this.#requireSyncAccessHandle(childPath, fileHandle);
    FileSystemUtilities.writeContents(syncAccessHandle, contents);
  }

  async exportDirectoryRecord(): Promise<TopDirectoryRecord> {
    throw new Error("Method not implemented.");
    /*
    const packages: DirectoryRecord = {}, urls: { [key: string]: DirectoryRecord } = {};
    return { packages, urls };
    */
  }

  getIndex(): Promise<TopDirectoryRecord> {
    throw new Error("Method not implemented.");
  }

  createDirDeep(pathToDir: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  readFileDeep(pathToFile: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  writeFileDeep(pathToFile: string, contents: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  removeEntry(pathToEntry: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  terminate(): Promise<void> {
    for (const pathToFile of this.#syncAccessMap.keys()) {
      this.#closeAndDeleteSyncAccessHandle(pathToFile);
    }
    return Promise.resolve();
  }
}
