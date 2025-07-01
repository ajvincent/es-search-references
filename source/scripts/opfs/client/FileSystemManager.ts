import type {
  OPFSFileSystemIfc
} from "../types/file-system.js";

import type {
  OPFSRequestMessageUnion,
  OPFSFulfillMessageUnion,
  OPFSRejectMessageUnion,
  OPFSExtract,
  UUID,
} from "../types/messages.js";

export class OPFSFileSystemClientImpl implements OPFSFileSystemIfc {
  static async build(pathToRootDir: string): Promise<OPFSFileSystemClientImpl> {
    const url = new URL("../worker/FileSystemManager.js", import.meta.url);
    url.searchParams.set("pathToRootDir", pathToRootDir);
    const worker = new Worker(url, { type: "module" });

    const { promise, resolve } = Promise.withResolvers<void>();
    worker.onmessage = (event => {
      if (event.data === "initialized")
        resolve();
    });

    await promise;
    return new OPFSFileSystemClientImpl(worker);
  }

  readonly #worker: Worker;
  readonly #uuidToResolversMap = new Map<UUID, Record<"resolve" | "reject", (value: any) => void>>;

  private constructor(
    worker: Worker
  )
  {
    this.#worker = worker;
    this.#worker.onmessage = event => this.#processResponse(event.data);
  }

  echo(token: string): Promise<{ token: string; pathToRoot: string; }> {
    return this.#requestAsync("echo", [token]);
  }

  getFileSystems(): Promise<{ [key: string]: string; }> {
    return this.#requestAsync("getFileSystems", []);
  }

  #requestAsync<ServiceName extends keyof OPFSFileSystemIfc>(
    serviceName: ServiceName,
    parameters: OPFSExtract<OPFSRequestMessageUnion, ServiceName>["parameters"]
  ): Promise<OPFSExtract<OPFSFulfillMessageUnion, ServiceName>["result"]>
  {
    // @ts-expect-error
    const message: OPFSExtract<OPFSRequestMessageUnion, typeof serviceName> = {
      serviceName,
      uuid: window.crypto.randomUUID(),
      parameters,
    };

    const { promise, resolve, reject } = Promise.withResolvers<
      OPFSExtract<OPFSFulfillMessageUnion, ServiceName>["result"]
    >();
    this.#uuidToResolversMap.set(message.uuid, { resolve, reject });
    this.#worker.postMessage(message);
    return promise;
  }

  #processResponse(
    message: OPFSFulfillMessageUnion | OPFSRejectMessageUnion
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

  terminate(): void {
    this.#worker.terminate();
    if (this.#uuidToResolversMap.size) {
      const err = new Error("worker terminated");
      for (const {reject} of this.#uuidToResolversMap.values()) {
        reject(err);
      }
    }
  }
}
