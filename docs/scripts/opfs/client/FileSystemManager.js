import { DirectoryClient, REQUEST_ASYNC_METHOD, BUILD_WORKER_METHOD } from "./DirectoryClient.js";
export class OPFSFileSystemManagerClientImpl extends DirectoryClient {
    static async build(pathToRootDir) {
        const worker = await DirectoryClient[BUILD_WORKER_METHOD]("../worker/FileSystemManager.js", pathToRootDir);
        return new OPFSFileSystemManagerClientImpl(worker);
    }
    echo(token) {
        return this[REQUEST_ASYNC_METHOD]("echo", [token]);
    }
    getFileSystems() {
        return this[REQUEST_ASYNC_METHOD]("getFileSystems", []);
    }
}
