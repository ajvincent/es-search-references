import type {
  DirectoryRecord,
  OPFSWebFileSystemIfc,
  TopDirectoryRecord
} from "../types/WebFileSystemIfc.js";

import {
  DirectoryClient,
  REQUEST_ASYNC_METHOD,
  BUILD_WORKER_METHOD
} from "./DirectoryClient.js";

export class OPFSWebFileSystemClientImpl
extends DirectoryClient<OPFSWebFileSystemIfc>
implements OPFSWebFileSystemIfc
{
  static async build(
    pathToRootDir: string,
    pathToClipboardDir: string
  ): Promise<OPFSWebFileSystemClientImpl>
  {
    const worker = await DirectoryClient[BUILD_WORKER_METHOD](
      "../worker/WebFileSystem.js",
      pathToRootDir,
      new Map([["pathToClipboardDir", pathToClipboardDir]])
    );
    return new OPFSWebFileSystemClientImpl(worker);
  }

  getWebFilesRecord(): Promise<{ [key: string]: string; }> {
    return this[REQUEST_ASYNC_METHOD]("getWebFilesRecord", []);
  }

  importDirectoryRecord(dirRecord: TopDirectoryRecord): Promise<void> {
    return this[REQUEST_ASYNC_METHOD]("importDirectoryRecord", [dirRecord]);
  }

  exportDirectoryRecord(): Promise<TopDirectoryRecord> {
    return this[REQUEST_ASYNC_METHOD]("exportDirectoryRecord", []);
  }

  getIndex(): Promise<DirectoryRecord> {
    return this[REQUEST_ASYNC_METHOD]("getIndex", []);
  }

  createDirDeep(pathToDir: string): Promise<void> {
    return this[REQUEST_ASYNC_METHOD]("createDirDeep", [pathToDir]);
  }

  readFileDeep(pathToFile: string): Promise<string> {
    return this[REQUEST_ASYNC_METHOD]("readFileDeep", [pathToFile]);
  }

  writeFileDeep(pathToFile: string, contents: string): Promise<void> {
    return this[REQUEST_ASYNC_METHOD]("writeFileDeep", [pathToFile, contents]);
  }

  removeEntryDeep(pathToEntry: string): Promise<void> {
    return this[REQUEST_ASYNC_METHOD]("removeEntryDeep", [pathToEntry]);
  }

  getClipboardIndex(): Promise<DirectoryRecord> {
    return this[REQUEST_ASYNC_METHOD]("getClipboardIndex", []);
  }

  copyFromClipboard(pathToDir: string): Promise<void> {
    return this[REQUEST_ASYNC_METHOD]("copyFromClipboard", [pathToDir]);
  }

  copyToClipboard(pathToEntry: string): Promise<void> {
    return this[REQUEST_ASYNC_METHOD]("copyToClipboard", [pathToEntry]);
  }

  readClipboardFile(pathToFile: string): Promise<string> {
    return this[REQUEST_ASYNC_METHOD]("readClipboardFile", [pathToFile]);
  }

  clearClipboard(): Promise<void> {
    return this[REQUEST_ASYNC_METHOD]("clearClipboard", []);
  }

  async terminate(): Promise<void> {
    await this[REQUEST_ASYNC_METHOD]("terminate", []);
    super.terminate();
  }
}
