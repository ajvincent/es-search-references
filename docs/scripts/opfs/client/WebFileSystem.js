import { DirectoryClient, REQUEST_ASYNC_METHOD, BUILD_WORKER_METHOD } from "./DirectoryClient.js";
export class OPFSWebFileSystemClientImpl extends DirectoryClient {
    static async build(pathToRootDir, pathToClipboardDir) {
        const worker = await DirectoryClient[BUILD_WORKER_METHOD]("../worker/WebFileSystem.js", pathToRootDir, new Map([["pathToClipboardDir", pathToClipboardDir]]));
        return new OPFSWebFileSystemClientImpl(worker);
    }
    getWebFilesRecord() {
        return this[REQUEST_ASYNC_METHOD]("getWebFilesRecord", []);
    }
    importDirectoryRecord(dirRecord) {
        return this[REQUEST_ASYNC_METHOD]("importDirectoryRecord", [dirRecord]);
    }
    exportDirectoryRecord() {
        return this[REQUEST_ASYNC_METHOD]("exportDirectoryRecord", []);
    }
    getIndex() {
        return this[REQUEST_ASYNC_METHOD]("getIndex", []);
    }
    createDirDeep(pathToDir) {
        return this[REQUEST_ASYNC_METHOD]("createDirDeep", [pathToDir]);
    }
    readFileDeep(pathToFile) {
        return this[REQUEST_ASYNC_METHOD]("readFileDeep", [pathToFile]);
    }
    writeFileDeep(pathToFile, contents) {
        return this[REQUEST_ASYNC_METHOD]("writeFileDeep", [pathToFile, contents]);
    }
    removeEntryDeep(pathToEntry) {
        return this[REQUEST_ASYNC_METHOD]("removeEntryDeep", [pathToEntry]);
    }
    getClipboardIndex() {
        return this[REQUEST_ASYNC_METHOD]("getClipboardIndex", []);
    }
    copyFromClipboard(pathToDir) {
        return this[REQUEST_ASYNC_METHOD]("copyFromClipboard", [pathToDir]);
    }
    copyToClipboard(pathToEntry) {
        return this[REQUEST_ASYNC_METHOD]("copyToClipboard", [pathToEntry]);
    }
    clearClipboard() {
        return this[REQUEST_ASYNC_METHOD]("clearClipboard", []);
    }
    async terminate() {
        await this[REQUEST_ASYNC_METHOD]("terminate", []);
        super.terminate();
    }
}
