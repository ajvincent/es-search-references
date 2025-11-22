const WorkerGlobal = self;
const SEARCH_PARAMS = Symbol("#searchParams");
const GET_ROOT_DIR_PATH = Symbol("#getRootDirPath");
const GET_ROOT_DIR_METHOD = Symbol("#getRootDir");
export { SEARCH_PARAMS, GET_ROOT_DIR_PATH, GET_ROOT_DIR_METHOD };
export class DirectoryWorker {
    static [SEARCH_PARAMS] = new URLSearchParams(WorkerGlobal.location.search);
    static [GET_ROOT_DIR_PATH]() {
        return this[SEARCH_PARAMS].get("pathToRootDir");
    }
    static async [GET_ROOT_DIR_METHOD]() {
        const stepsToRootDir = this[GET_ROOT_DIR_PATH]().split("/");
        let rootDir = await WorkerGlobal.navigator.storage.getDirectory();
        for (const step of stepsToRootDir) {
            rootDir = await rootDir.getDirectoryHandle(step, { create: true });
        }
        return rootDir;
    }
    constructor() {
        WorkerGlobal.onmessage = (event) => this.#callAsync(event.data);
    }
    // Worker support
    async #callAsync(requestMessage) {
        try {
            if (!(requestMessage.serviceName in this)) {
                throw new Error("service name not found: " + requestMessage.serviceName);
            }
            // @ts-expect-error assume the service exists
            if (typeof this[requestMessage.serviceName] !== "function") {
                throw new Error("service is not a method: " + requestMessage.serviceName);
            }
            // @ts-expect-error assume the service exists
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
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
            // @ts-expect-error we've formatted this correctly as far as I can tell
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
