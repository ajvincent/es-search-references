import type {
  OPFSFileSystemManagerIfc,
} from "../types/FileSystemManagerIfc.js";

import type {
  UUID
} from "../types/messages.js";

import {
  DirectoryWorker,
  GET_ROOT_DIR_METHOD,
} from "./DirectoryWorker.js";

import {
  JSONMap
} from "./JSONMap.js";

const WorkerGlobal = self as unknown as DedicatedWorkerGlobalScope;

class OPFSFileSystemManagerWorker
extends DirectoryWorker<OPFSFileSystemManagerIfc>
implements OPFSFileSystemManagerIfc
{
  static async build(): Promise<void> {
    const topDir = await DirectoryWorker[GET_ROOT_DIR_METHOD]();

    const systemsDir: FileSystemDirectoryHandle = await topDir.getDirectoryHandle(
      "filesystems", { create: true }
    );
    const indexFile: FileSystemFileHandle = await topDir.getFileHandle(
      "index.json", { create: true }
    );
    const indexSync: FileSystemSyncAccessHandle = await indexFile.createSyncAccessHandle();
    const indexMap = new JSONMap<UUID, string>(indexSync);

    void(new OPFSFileSystemManagerWorker(systemsDir, indexMap));
    WorkerGlobal.postMessage("initialized");
  }

  readonly #systemsDir: FileSystemDirectoryHandle;
  readonly #indexMap: JSONMap<UUID, string>;
  readonly #descriptionsSet: Set<string>;

  private constructor(
    systemsDir: FileSystemDirectoryHandle,
    indexMap: JSONMap<UUID, string>,
  )
  {
    super();
    this.#systemsDir = systemsDir;
    this.#indexMap = indexMap;
    this.#descriptionsSet = new Set(indexMap.values());
  }

  // OPFSFileSystemIfc
  getAvailableSystems(): Promise<{ [key: string]: string; }> {
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

    return key;
  }

  // OPFSFileSystemIfc
  setDescription(
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

    return Promise.resolve(null);
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

    return null;
  }

  // OPFSFileSystemIfc
  terminate(): Promise<void> {
    this.#indexMap.close();
    return Promise.resolve();
  }
}

await OPFSFileSystemManagerWorker.build();
