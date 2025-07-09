import type {
  OPFSFileSystemManagerIfc,
} from "../types/FileSystemManagerIfc.js";

import type {
  OPFSWebFileSystemIfc,
} from "../types/WebFileSystemIfc.js";

import type {
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
  #webFsMap: Map<string, OPFSWebFileSystemIfc> | undefined = new Map;

  private constructor(
    fsManager: OPFSFileSystemManagerIfc
  )
  {
    this.#fsManager = fsManager;
  }

  get fsManager(): OPFSFileSystemManagerIfc {
    if (!this.#isLive || !this.#fsManager) {
      throw new Error("this front end is dead");
    }
    return this.#fsManager;
  }

  async getWebFS(key: UUID): Promise<OPFSWebFileSystemIfc>
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
      this.fsManager.getWebFSPath(key),
      this.fsManager.getClipboardPath()
    ]);
    webFS = await OPFSWebFileSystemClientImpl.build(
      pathToWebFiles, clipboardPath
    );

    this.#webFsMap.set(key, webFS);
    return webFS;
  }

  async removeWebFS(key: UUID): Promise<void>
  {
    if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
      throw new Error("this front end is dead");
    }
    const webFS: OPFSWebFileSystemIfc | undefined = this.#webFsMap.get(key);
    if (!webFS)
      return;

    this.#webFsMap.delete(key);
    await webFS.terminate();
    await this.#fsManager.remove(key);
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
    await this.fsManager.terminate();

    this.#webFsMap = undefined;
    this.#fsManager = undefined;
  }
}
