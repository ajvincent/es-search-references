const REQUEST_ASYNC_METHOD = Symbol("#requestAsync");
const BUILD_WORKER_METHOD = Symbol("#buildWorker");
export { REQUEST_ASYNC_METHOD, BUILD_WORKER_METHOD, };
export class DirectoryClient {
    static [BUILD_WORKER_METHOD](pathToWorker, pathToRootDir) {
        const url = new URL(pathToWorker, import.meta.url);
        url.searchParams.set("pathToRootDir", pathToRootDir);
        const worker = new Worker(url, { type: "module" });
        const { promise, resolve } = Promise.withResolvers();
        worker.onmessage = (event => {
            if (event.data === "initialized")
                resolve(worker);
        });
        return promise;
    }
    #worker;
    #uuidToResolversMap = new Map;
    constructor(worker) {
        this.#worker = worker;
        this.#worker.onmessage = event => this.#processResponse(event.data);
    }
    [REQUEST_ASYNC_METHOD](serviceName, parameters) {
        // @ts-expect-error
        const message = {
            serviceName,
            uuid: window.crypto.randomUUID(),
            parameters,
        };
        const { promise, resolve, reject } = Promise.withResolvers();
        this.#uuidToResolversMap.set(message.uuid, { resolve, reject });
        this.#worker.postMessage(message);
        return promise;
    }
    #processResponse(message) {
        const { resolve, reject } = this.#uuidToResolversMap.get(message.uuid);
        this.#uuidToResolversMap.delete(message.uuid);
        if (message.isSuccess) {
            resolve(message.result);
        }
        else {
            reject(message.exception);
        }
    }
    terminate() {
        this.#worker.terminate();
        if (this.#uuidToResolversMap.size) {
            const err = new Error("worker terminated");
            for (const { reject } of this.#uuidToResolversMap.values()) {
                reject(err);
            }
            this.#uuidToResolversMap.clear();
        }
    }
}
