import type {
  OPFSFileSystemManagerIfc,
} from "../types/FileSystemManagerIfc.js";

import type {
  UUID
} from "../types/messages.js";

import {
  DirectoryClient,
  REQUEST_ASYNC_METHOD,
  BUILD_WORKER_METHOD
} from "./DirectoryClient.js";

export class OPFSFileSystemManagerClientImpl
extends DirectoryClient<OPFSFileSystemManagerIfc>
implements OPFSFileSystemManagerIfc
{
  static async build(
    pathToRootDir: string
  ): Promise<OPFSFileSystemManagerClientImpl>
  {
    const worker = await DirectoryClient[BUILD_WORKER_METHOD](
      "../worker/FileSystemManager.js",
      pathToRootDir
    );
    return new OPFSFileSystemManagerClientImpl(worker);
  }

  getAvailableSystems(): Promise<{ [key: string]: string; }> {
    return this[REQUEST_ASYNC_METHOD]("getAvailableSystems", []);
  }

  buildEmpty(description: string): Promise<UUID> {
    return this[REQUEST_ASYNC_METHOD]("buildEmpty", [description]);
  }

  setDescription(key: UUID, newDescription: string): Promise<null> {
    return this[REQUEST_ASYNC_METHOD]("setDescription", [key, newDescription]);
  }

  remove(key: UUID): Promise<null> {
    return this[REQUEST_ASYNC_METHOD]("remove", [key]);
  }

  getClipboardPath(): Promise<string> {
    return this[REQUEST_ASYNC_METHOD]("getClipboardPath", []);
  }

  async terminate(): Promise<void> {
    await this[REQUEST_ASYNC_METHOD]("terminate", []);
    super.terminate();
  }
}
