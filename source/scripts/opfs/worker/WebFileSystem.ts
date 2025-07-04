import {
  AwaitedMap
} from "../../utilities/AwaitedMap.js";

import type {
  DirectoryRecord,
  OPFSWebFileSystemIfc,
  TopDirectoryRecord,
} from "../types/WebFileSystemIfc.js";

import {
  DirectoryWorker,
  GET_ROOT_DIR_METHOD
} from "./DirectoryWorker.js";

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

    void(new OPFSWebFileSystemWorker(packagesDir, new URLDirHandle(urlsDir)));
    WorkerGlobal.postMessage("initialized");
  }

  static #getPathSequence(
    pathToEntry: string
  ): string[]
  {
    if (URL.canParse(pathToEntry)) {
      const {protocol, hostname, pathname} = URL.parse(pathToEntry)!;
      return [protocol + "://", hostname, ...pathname.substring(1).split("/")];
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

  readonly #packagesDir: FileSystemDirectoryHandle;
  readonly #urlsDir: URLDirHandle;

  private constructor(
    packagesDir: FileSystemDirectoryHandle,
    urlsDir: URLDirHandle,
  )
  {
    super();
    this.#packagesDir = packagesDir;
    this.#urlsDir = urlsDir;
  }

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
    const fileEntries = await Array.fromAsync(dirHandle.entries());

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

  async readFileDeep(
    pathToFile: string
  ): Promise<string>
  {
    const fileHandle = await this.#getFileDeep(pathToFile, false);
    return FileSystemUtilities.readFile(fileHandle);
  }

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

  async removeEntry(pathToEntry: string): Promise<void> {
    const pathSequence = OPFSWebFileSystemWorker.#getPathSequence(pathToEntry);
    const leafName = pathSequence.pop()!;

    const dirHandle = await OPFSWebFileSystemWorker.#getDirectoryDeep(
      URL.canParse(pathToEntry) ? this.#urlsDir : this.#packagesDir,
      pathSequence,
      false
    );

    return dirHandle.removeEntry(leafName);
  }

  terminate(): Promise<void> {
    return Promise.resolve();
  }
}

await OPFSWebFileSystemWorker.build();
