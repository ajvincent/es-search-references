const WorkerGlobal = self;
const GET_ROOT_DIR_METHOD = Symbol("#getRootDir");
export { GET_ROOT_DIR_METHOD };
export class DirectoryWorker {
    static async [GET_ROOT_DIR_METHOD]() {
        const params = new URLSearchParams(WorkerGlobal.location.search);
        const stepsToRootDir = params.get("pathToRootDir").split("/");
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
            // @ts-expect-error
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
