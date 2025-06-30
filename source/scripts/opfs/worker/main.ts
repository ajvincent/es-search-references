import type {
  OPFSFileSystemIfc
} from "../types/file-system.js";

import type {
  OPFSRequestMessageUnion,
  OPFSFulfillMessageUnion,
  OPFSRejectMessageUnion,
} from "../types/messages.js";

const WorkerGlobal = self as unknown as DedicatedWorkerGlobalScope;

class OPFSFileSystemWorker implements OPFSFileSystemIfc {
  readonly #rootDir: FileSystemDirectoryHandle;

  constructor(rootDir: FileSystemDirectoryHandle) {
    WorkerGlobal.onmessage = event => this.#callAsync(event.data);
    this.#rootDir = rootDir;
  }

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

  setFileSystemKey(
    key: string
  ): Promise<void>
  {
    throw new Error("Method not implemented.");
  }

  // Worker support
  async #callAsync
  (
    requestMessage: OPFSRequestMessageUnion
  ): Promise<void>
  {
    try {
      // @ts-expect-error
      const result = await this[requestMessage.serviceName](...requestMessage.parameters)
      // @ts-expect-error merging the types back together is troublesome, but this works for each type... I think
      const fulfilledMessage: OPFSFulfillMessageUnion = {
        serviceName: requestMessage.serviceName,
        uuid: requestMessage.uuid,
        isSuccess: true,
        result,
      };
      WorkerGlobal.postMessage(fulfilledMessage);
    }
    catch (ex) {
      const rejectedMessage: OPFSRejectMessageUnion = {
        serviceName: requestMessage.serviceName,
        uuid: requestMessage.uuid,
        isSuccess: false,
        exception: ex
      };
      WorkerGlobal.postMessage(rejectedMessage);
    }
  }
}

{
  const params = new URLSearchParams(WorkerGlobal.location.search);
  const stepsToRootDir: readonly string[] = params.get("pathToRootDir")!.split("/");
  let rootDir = await WorkerGlobal.navigator.storage.getDirectory();
  for (const step of stepsToRootDir) {
    rootDir = await rootDir.getDirectoryHandle(step, { create: true });
  }
  void(new OPFSFileSystemWorker(rootDir));
}

WorkerGlobal.postMessage("initialized");
