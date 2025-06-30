export class OPFSFileSystemClientImpl {
    static async build(pathToRootDir) {
        const url = new URL("./worker/main.js", import.meta.url);
        url.searchParams.set("pathToRootDir", pathToRootDir);
        const worker = new Worker(url, { type: "module" });
        const { promise, resolve } = Promise.withResolvers();
        worker.onmessage = (event => {
            if (event.data === "initialized")
                resolve();
        });
        await promise;
        return new OPFSFileSystemClientImpl(worker);
    }
    #worker;
    #uuidToResolversMap = new Map;
    constructor(worker) {
        this.#worker = worker;
        this.#worker.onmessage = event => this.#processResponse(event.data);
    }
    echo(token) {
        return this.#requestAsync("echo", [token]);
    }
    getFileSystems() {
        return this.#requestAsync("getFileSystems", []);
    }
    setFileSystemKey(key) {
        return this.#requestAsync("setFileSystemKey", [key]);
    }
    #requestAsync(serviceName, parameters) {
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
        }
    }
}
