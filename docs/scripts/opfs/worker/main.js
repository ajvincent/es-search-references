const WorkerGlobal = self;
class OPFSFileSystemWorker {
    #rootDir;
    constructor(rootDir) {
        WorkerGlobal.onmessage = event => this.#callAsync(event.data);
        this.#rootDir = rootDir;
    }
    echo(token) {
        console.log("token: " + token);
        const params = new URLSearchParams(WorkerGlobal.location.search);
        const pathToRoot = params.get("pathToRootDir");
        return Promise.resolve({ token, pathToRoot });
    }
    // OPFSFileSystemIfc
    getFileSystems() {
        throw new Error("Method not implemented.");
    }
    setFileSystemKey(key) {
        throw new Error("Method not implemented.");
    }
    // Worker support
    async #callAsync(requestMessage) {
        try {
            // @ts-expect-error
            const result = await this[requestMessage.serviceName](...requestMessage.parameters);
            // @ts-expect-error merging the types back together is troublesome, but this works for each type... I think
            const fulfilledMessage = {
                serviceName: requestMessage.serviceName,
                uuid: requestMessage.uuid,
                isSuccess: true,
                result,
            };
            WorkerGlobal.postMessage(fulfilledMessage);
        }
        catch (ex) {
            const rejectedMessage = {
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
    const stepsToRootDir = params.get("pathToRootDir").split("/");
    let rootDir = await WorkerGlobal.navigator.storage.getDirectory();
    for (const step of stepsToRootDir) {
        rootDir = await rootDir.getDirectoryHandle(step, { create: true });
    }
    void (new OPFSFileSystemWorker(rootDir));
}
WorkerGlobal.postMessage("initialized");
export {};
