import type {
  OPFSFileSystemManagerIfc,
} from "../types/FileSystemManagerIfc.js";

import type {
  OPFSWebFileSystemIfc,
} from "../types/WebFileSystemIfc.js";

import type {
  FileSystemsRecords,
  UUID
} from "../types/messages.js";

import {
  OPFSFileSystemManagerClientImpl
} from "./FileSystemManager.js";

import {
  OPFSWebFileSystemClientImpl
} from "./WebFileSystem.js";

export class OPFSFrontEnd {
  static async build(pathToRootDir: string): Promise<OPFSFrontEnd>
  {
    const manager = await OPFSFileSystemManagerClientImpl.build(pathToRootDir);
    return new OPFSFrontEnd(manager);
  }

  #isLive = true;
  #fsManager: OPFSFileSystemManagerIfc | undefined;
  #webFsMap: Map<UUID, OPFSWebFileSystemIfc> | undefined = new Map;

  private constructor(
    fsManager: OPFSFileSystemManagerIfc
  )
  {
    this.#fsManager = fsManager;
  }

  async getAvailableSystems(): Promise<FileSystemsRecords>
  {
    if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
      throw new Error("this front end is dead");
    }
    return this.#fsManager.getAvailableSystems();
  }

  async getWebFS(
    key: UUID
  ): Promise<OPFSWebFileSystemIfc>
  {
    if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
      throw new Error("this front end is dead");
    }

    let webFS: OPFSWebFileSystemIfc | undefined = this.#webFsMap.get(key);
    if (webFS)
      return webFS;

    const [
      pathToWebFiles,
      clipboardPath
    ] = await Promise.all([
      this.#fsManager.getWebFSPath(key),
      this.#fsManager.getClipboardPath()
    ]);
    webFS = await OPFSWebFileSystemClientImpl.build(
      pathToWebFiles, clipboardPath
    );

    this.#webFsMap.set(key, webFS);
    return webFS;
  }

  async buildEmpty(
    description: string
  ): Promise<UUID>
  {
    if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
      throw new Error("this front end is dead");
    }
    return this.#fsManager.buildEmpty(description);
  }

  async removeWebFS(
    key: UUID
  ): Promise<boolean>
  {
    if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
      throw new Error("this front end is dead");
    }
    const webFS: OPFSWebFileSystemIfc | undefined = this.#webFsMap.get(key);
    if (!webFS)
      return false;

    this.#webFsMap.delete(key);
    await webFS.terminate();
    await this.#fsManager.remove(key);
    return true;
  }

  async setDescription(key: UUID, newDescription: string): Promise<void> {
    if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
      throw new Error("this front end is dead");
    }

    await this.#fsManager.setDescription(key, newDescription);
  }

  async terminate(): Promise<void>
  {
    if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
      throw new Error("this front end is dead");
    }
    this.#isLive = false;

    let promises = new Set<Promise<void>>;
    for (const webFS of this.#webFsMap.values()) {
      promises.add(webFS.terminate());
    }
    await Promise.all(promises);
    await this.#fsManager.terminate();

    this.#webFsMap = undefined;
    this.#fsManager = undefined;
  }
}
