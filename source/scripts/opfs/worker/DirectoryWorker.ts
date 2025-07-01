import type {
  RequestMessageUnion,
  FulfillMessageUnion,
  RejectMessageUnion,
} from "../types/messages.js";

const WorkerGlobal = self as unknown as DedicatedWorkerGlobalScope;

const GET_ROOT_DIR_METHOD = Symbol("#getRootDir");
export {
  GET_ROOT_DIR_METHOD
}

export class DirectoryWorker<Type> {
  protected static async [GET_ROOT_DIR_METHOD](): Promise<FileSystemDirectoryHandle>
  {
    const params = new URLSearchParams(WorkerGlobal.location.search);
    const stepsToRootDir: readonly string[] = params.get("pathToRootDir")!.split("/");
    let rootDir = await WorkerGlobal.navigator.storage.getDirectory();
    for (const step of stepsToRootDir) {
      rootDir = await rootDir.getDirectoryHandle(step, { create: true });
    }
    return rootDir;
  }

  constructor() {
    WorkerGlobal.onmessage = event => this.#callAsync(event.data);
  }

  // Worker support
  async #callAsync
  (
    requestMessage: RequestMessageUnion<Type>
  ): Promise<void>
  {
    try {
      // @ts-expect-error
      const result = await this[requestMessage.serviceName](...requestMessage.parameters);
      // @ts-expect-error merging the types back together is troublesome, but this works for each type... I think
      const fulfilledMessage: FulfillMessageUnion<Type> = {
        serviceName: requestMessage.serviceName,
        uuid: requestMessage.uuid,
        isSuccess: true,
        result,
      };
      WorkerGlobal.postMessage(fulfilledMessage);
    }
    catch (ex) {
      // @ts-expect-error
      const rejectedMessage: RejectMessageUnion<Type> = {
        serviceName: requestMessage.serviceName,
        uuid: requestMessage.uuid,
        isSuccess: false,
        exception: ex
      };
      WorkerGlobal.postMessage(rejectedMessage);
    }
  }
}
