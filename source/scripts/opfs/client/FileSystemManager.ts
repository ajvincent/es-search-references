import type {
  OPFSFileSystemManagerIfc,
} from "../types/FileSystemManager.js";

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

  echo(token: string): Promise<{ token: string; pathToRoot: string; }> {
    return this[REQUEST_ASYNC_METHOD]("echo", [token]);
  }

  getFileSystems(): Promise<{ [key: string]: string; }> {
    return this[REQUEST_ASYNC_METHOD]("getFileSystems", []);
  }
}
