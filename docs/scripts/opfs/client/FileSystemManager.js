import { DirectoryClient, REQUEST_ASYNC_METHOD, BUILD_WORKER_METHOD } from "./DirectoryClient.js";
export class OPFSFileSystemManagerClientImpl extends DirectoryClient {
    static async build(pathToRootDir) {
        const worker = await DirectoryClient[BUILD_WORKER_METHOD]("../worker/FileSystemManager.js", pathToRootDir);
        return new OPFSFileSystemManagerClientImpl(worker);
    }
    getAvailableSystems() {
        return this[REQUEST_ASYNC_METHOD]("getAvailableSystems", []);
    }
    buildEmpty(description) {
        return this[REQUEST_ASYNC_METHOD]("buildEmpty", [description]);
    }
    setDescription(key, newDescription) {
        return this[REQUEST_ASYNC_METHOD]("setDescription", [key, newDescription]);
    }
    remove(key) {
        return this[REQUEST_ASYNC_METHOD]("remove", [key]);
    }
    getWebFSPath(key) {
        return this[REQUEST_ASYNC_METHOD]("getWebFSPath", [key]);
    }
    getClipboardPath() {
        return this[REQUEST_ASYNC_METHOD]("getClipboardPath", []);
    }
    async terminate() {
        await this[REQUEST_ASYNC_METHOD]("terminate", []);
        super.terminate();
    }
}
