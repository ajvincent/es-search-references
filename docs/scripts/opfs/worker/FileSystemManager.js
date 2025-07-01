import { DirectoryWorker, GET_ROOT_DIR_METHOD, } from "./DirectoryWorker.js";
const WorkerGlobal = self;
class OPFSFileSystemManagerWorker extends DirectoryWorker {
    static async build() {
        const rootDir = await DirectoryWorker[GET_ROOT_DIR_METHOD]();
        void (new OPFSFileSystemManagerWorker(rootDir));
        WorkerGlobal.postMessage("initialized");
    }
    #rootDir;
    constructor(rootDir) {
        super();
        this.#rootDir = rootDir;
    }
    // OPFSFileSystemIfc
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
}
await OPFSFileSystemManagerWorker.build();
