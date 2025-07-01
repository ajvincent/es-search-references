import type {
  RequestMessageUnion,
  FulfillMessageUnion,
  RejectMessageUnion,
  WorkerUnionExtract,
  UUID,
} from "../types/messages.js";

const REQUEST_ASYNC_METHOD = Symbol("#requestAsync");
const BUILD_WORKER_METHOD = Symbol("#buildWorker");
export {
  REQUEST_ASYNC_METHOD,
  BUILD_WORKER_METHOD,
};

export class DirectoryClient<Type>
{
  protected static [BUILD_WORKER_METHOD](
    pathToWorker: string,
    pathToRootDir: string,
  ): Promise<Worker>
  {
    const url = new URL(pathToWorker, import.meta.url);
    url.searchParams.set("pathToRootDir", pathToRootDir);
    const worker = new Worker(url, { type: "module" });

    const { promise, resolve } = Promise.withResolvers<Worker>();
    worker.onmessage = (event => {
      if (event.data === "initialized")
        resolve(worker);
    });

    return promise;
  }

  readonly #worker: Worker;
  readonly #uuidToResolversMap = new Map<UUID, Record<"resolve" | "reject", (value: any) => void>>;

  protected constructor(
    worker: Worker
  )
  {
    this.#worker = worker;
    this.#worker.onmessage = event => this.#processResponse(event.data);
  }

  protected [REQUEST_ASYNC_METHOD]<ServiceName extends keyof Type>(
      serviceName: ServiceName,
      parameters: WorkerUnionExtract<Type, RequestMessageUnion<Type>, ServiceName>["parameters"]
    ): Promise<WorkerUnionExtract<Type, FulfillMessageUnion<Type>, ServiceName>["result"]>
    {
      // @ts-expect-error
      const message: WorkerUnionExtract<Type, RequestMessageUnion<Type>, typeof serviceName> = {
        serviceName,
        uuid: window.crypto.randomUUID(),
        parameters,
      };

      const { promise, resolve, reject } = Promise.withResolvers<
        WorkerUnionExtract<Type, FulfillMessageUnion<Type>, ServiceName>["result"]
      >();
      this.#uuidToResolversMap.set(message.uuid, { resolve, reject });
      this.#worker.postMessage(message);
      return promise;
    }

  #processResponse(
    message: FulfillMessageUnion<Type> | RejectMessageUnion<Type>
  ): void
  {
    const { resolve, reject } = this.#uuidToResolversMap.get(message.uuid)!;
    this.#uuidToResolversMap.delete(message.uuid);
    if (message.isSuccess) {
      resolve(message.result);
    } else {
      reject(message.exception);
    }
  }

  public terminate(): void {
    this.#worker.terminate();
    if (this.#uuidToResolversMap.size) {
      const err = new Error("worker terminated");
      for (const {reject} of this.#uuidToResolversMap.values()) {
        reject(err);
      }
      this.#uuidToResolversMap.clear();
    }
  }
}

