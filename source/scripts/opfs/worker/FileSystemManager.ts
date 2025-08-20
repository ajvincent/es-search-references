import type {
  OPFSFileSystemManagerIfc,
} from "../types/FileSystemManagerIfc.js";

import type {
  FileSystemsRecords,
  UUID
} from "../types/messages.js";

import {
  DirectoryWorker,
  GET_ROOT_DIR_METHOD,
  GET_ROOT_DIR_PATH,
} from "./DirectoryWorker.js";

import {
  AsyncJSONMap
} from "./AsyncJSONMap.js";

const WorkerGlobal = self as unknown as DedicatedWorkerGlobalScope;

class OPFSFileSystemManagerWorker
extends DirectoryWorker<OPFSFileSystemManagerIfc>
implements OPFSFileSystemManagerIfc
{
  static async build(): Promise<void> {
    const topDir = await DirectoryWorker[GET_ROOT_DIR_METHOD]();

    const [systemsDir, indexFile, clipboardDir] = await Promise.all([
      topDir.getDirectoryHandle("filesystems", { create: true }),
      topDir.getFileHandle("index.json", { create: true }),
      topDir.getDirectoryHandle("clipboard", { create: true }),
    ])

    const indexMap = await AsyncJSONMap.build<UUID, string>(indexFile);

    void(new OPFSFileSystemManagerWorker(topDir + "/filesystems", systemsDir, indexMap));
    void(clipboardDir);
    WorkerGlobal.postMessage("initialized");
  }

  readonly #pathToSystemsDir: string;
  readonly #systemsDir: FileSystemDirectoryHandle;
  readonly #indexMap: AsyncJSONMap<UUID, string>;
  readonly #descriptionsSet: Set<string>;

  private constructor(
    pathToSystemsDir: string,
    systemsDir: FileSystemDirectoryHandle,
    indexMap: AsyncJSONMap<UUID, string>,
  )
  {
    super();
    this.#pathToSystemsDir = pathToSystemsDir;
    this.#systemsDir = systemsDir;
    this.#indexMap = indexMap;
    this.#descriptionsSet = new Set(indexMap.values());
  }

  // OPFSFileSystemIfc
  getAvailableSystems(): Promise<FileSystemsRecords> {
    return Promise.resolve(Object.fromEntries(this.#indexMap));
  }

  // OPFSFileSystemIfc
  async buildEmpty(
    newDescription: string
  ): Promise<UUID>
  {
    newDescription = newDescription.trim();
    if (!newDescription) {
      throw new Error("whitespace descriptions not allowed");
    }
    if (this.#descriptionsSet.has(newDescription)) {
      throw new Error("description already exists");
    }
    const key = WorkerGlobal.crypto.randomUUID();

    await this.#systemsDir.getDirectoryHandle(key, { create: true });

    this.#indexMap.set(key, newDescription);
    this.#descriptionsSet.add(newDescription);
    await this.#indexMap.commit();

    return key;
  }

  // OPFSFileSystemIfc
  async setDescription(
    key: UUID,
    newDescription: string
  ): Promise<null>
  {
    newDescription = newDescription.trim();
    if (!newDescription) {
      throw new Error("whitespace descriptions not allowed");
    }
    if (this.#descriptionsSet.has(newDescription)) {
      throw new Error("description already exists");
    }
    if (!this.#indexMap.has(key)) {
      throw new Error("key not found: " + key);
    }

    const oldDescription = this.#indexMap.get(key)!;
    this.#indexMap.set(key, newDescription);
    this.#descriptionsSet.delete(oldDescription);
    this.#descriptionsSet.add(newDescription);
    await this.#indexMap.commit();

    return null;
  }

  // OPFSFileSystemIfc
  async remove(
    key: UUID
  ): Promise<null>
  {
    if (!this.#indexMap.has(key)) {
      throw new Error("key not found: " + key);
    }

    await this.#systemsDir.removeEntry(key, { recursive: true });
    const oldDescription = this.#indexMap.get(key)!;
    this.#indexMap.delete(key);
    this.#descriptionsSet.delete(oldDescription);
    await this.#indexMap.commit();

    return null;
  }

  // OPFSFileSystemIfc
  getWebFSPath(
    key: UUID
  ): Promise<string>
  {
    return Promise.resolve(this.#pathToSystemsDir + "/" + key);
  }

  // OPFSFileSystemIfc
  getClipboardPath(): Promise<string> {
    return Promise.resolve(OPFSFileSystemManagerWorker[GET_ROOT_DIR_PATH]() + "/clipboard");
  }

  // OPFSFileSystemIfc
  terminate(): Promise<void> {
    return Promise.resolve();
  }
}

await OPFSFileSystemManagerWorker.build();
