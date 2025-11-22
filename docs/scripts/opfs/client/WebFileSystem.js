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
    getDescendantIndex(pathToDir) {
        return this[REQUEST_ASYNC_METHOD]("getDescendantIndex", [pathToDir]);
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
    copyEntryDeep(parentDirectory, sourceLeafName, targetLeafName) {
        return this[REQUEST_ASYNC_METHOD]("copyEntryDeep", [
            parentDirectory, sourceLeafName, targetLeafName
        ]);
    }
    removeEntryDeep(pathToEntry) {
        return this[REQUEST_ASYNC_METHOD]("removeEntryDeep", [pathToEntry]);
    }
    listDirectoryMembers(pathToDir) {
        return this[REQUEST_ASYNC_METHOD]("listDirectoryMembers", [pathToDir]);
    }
    listSiblingMembers(pathToFile) {
        return this[REQUEST_ASYNC_METHOD]("listSiblingMembers", [pathToFile]);
    }
    listProtocols() {
        return this[REQUEST_ASYNC_METHOD]("listProtocols", []);
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
    readClipboardFile(pathToFile) {
        return this[REQUEST_ASYNC_METHOD]("readClipboardFile", [pathToFile]);
    }
    clearClipboard() {
        return this[REQUEST_ASYNC_METHOD]("clearClipboard", []);
    }
    async terminate() {
        await this[REQUEST_ASYNC_METHOD]("terminate", []);
        await super.terminate();
    }
}
