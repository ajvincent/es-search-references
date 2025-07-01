import type {
  OPFSFileSystemManagerIfc,
} from "../types/FileSystemManager.js";

import {
  DirectoryWorker,
  GET_ROOT_DIR_METHOD,
} from "./DirectoryWorker.js";

const WorkerGlobal = self as unknown as DedicatedWorkerGlobalScope;

class OPFSFileSystemManagerWorker
extends DirectoryWorker<OPFSFileSystemManagerIfc>
implements OPFSFileSystemManagerIfc
{
  static async build(): Promise<void> {
    const rootDir = await DirectoryWorker[GET_ROOT_DIR_METHOD]();
    void(new OPFSFileSystemManagerWorker(rootDir));
    WorkerGlobal.postMessage("initialized");
  }

  readonly #rootDir: FileSystemDirectoryHandle;

  private constructor(
    rootDir: FileSystemDirectoryHandle
  )
  {
    super();
    this.#rootDir = rootDir;
  }

  // OPFSFileSystemIfc
  echo(
    token: string
  ): Promise<{ token: string; pathToRoot: string; }>
  {
    console.log("token: " + token);
    const params = new URLSearchParams(WorkerGlobal.location.search);
    const pathToRoot = params.get("pathToRootDir")!;
    return Promise.resolve({ token, pathToRoot});
  }

  // OPFSFileSystemIfc
  getFileSystems(): Promise<{ [key: string]: string; }> {
    throw new Error("Method not implemented.");
  }
}

await OPFSFileSystemManagerWorker.build();
