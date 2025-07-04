import { DirectoryWorker, GET_ROOT_DIR_METHOD } from "./DirectoryWorker.js";
import { FileSystemUtilities } from "./FSUtilities.js";
const WorkerGlobal = self;
export class OPFSWebFileSystemWorker extends DirectoryWorker {
    static async build() {
        const topDir = await DirectoryWorker[GET_ROOT_DIR_METHOD]();
        const [packagesDir, urlsDir] = await Promise.all([
            topDir.getDirectoryHandle("packages", { create: true }),
            topDir.getDirectoryHandle("urls", { create: true })
        ]);
        const FSWorker = new OPFSWebFileSystemWorker(packagesDir, urlsDir);
        await FSWorker.fillSyncAccessMap();
        WorkerGlobal.postMessage("initialized");
    }
    #packagesDir;
    #urlsDir;
    #syncAccessMap = new Map;
    constructor(packagesDir, urlsDir) {
        super();
        this.#packagesDir = packagesDir;
        this.#urlsDir = urlsDir;
    }
    #resolvePathToEntry(pathToEntry) {
        if (URL.canParse(pathToEntry)) {
            const topDir = this.#urlsDir;
            const { protocol, hostname, pathname } = URL.parse(pathToEntry);
            let fullPath = protocol.substring(0, protocol.length - 1);
            if (hostname)
                fullPath += "/" + hostname + pathname;
            return [topDir, fullPath];
        }
        return [this.#packagesDir, pathToEntry];
    }
    async #getDirectoryDeep(currentDir, pathToDir, create) {
        const options = { create };
        for (const part of pathToDir.split("/")) {
            currentDir = await currentDir.getDirectoryHandle(part, options);
        }
        return currentDir;
    }
    async #requireSyncAccessHandle(pathToFile, fileHandle) {
        if (!this.#syncAccessMap.has(pathToFile)) {
            this.#syncAccessMap.set(pathToFile, await fileHandle.createSyncAccessHandle());
        }
        return this.#syncAccessMap.get(pathToFile);
    }
    #closeAndDeleteSyncAccessHandle(pathToFile) {
        const fileHandle = this.#syncAccessMap.get(pathToFile);
        if (fileHandle) {
            fileHandle.close();
        }
        this.#syncAccessMap.delete(pathToFile);
    }
    async fillSyncAccessMap() {
        const promisesSet = new Set;
        const handleCallback = (pathToEntry, entry) => {
            if (entry.kind === "file") {
                promisesSet.add(this.#requireSyncAccessHandle(pathToEntry, entry));
            }
        };
        // This sequential await is intentional: packages come before urls.
        await FileSystemUtilities.directoryTraversal("", this.#packagesDir, handleCallback);
        await FileSystemUtilities.protocolTraversal(this.#urlsDir, handleCallback);
        await Promise.all(promisesSet);
    }
    async getWebFilesRecord() {
        const entries = [];
        for (const [pathToFile, syncAccessHandle] of this.#syncAccessMap) {
            entries.push([pathToFile, FileSystemUtilities.readContents(syncAccessHandle)]);
        }
        return Promise.resolve(Object.fromEntries(entries));
    }
    async importDirectoryRecord(dirRecord) {
        let promisesSet = new Set;
        promisesSet.add(this.#addRecordsRecursive(this.#packagesDir, dirRecord.packages, ""));
        for (const [protocol, dirEntry] of Object.entries(dirRecord.urls)) {
            promisesSet.add(this.#addDirectoryRecursive(this.#urlsDir, protocol, dirEntry, protocol + "://"));
        }
        await Promise.all(promisesSet);
    }
    async #addRecordsRecursive(currentDir, dirRecord, pathToEntry) {
        const promises = new Set;
        for (const [key, stringOrDir] of Object.entries(dirRecord)) {
            const childPath = key ? pathToEntry + "/" + key : key;
            if (typeof stringOrDir === "string") {
                promises.add(this.#addFileShallow(currentDir, key, stringOrDir, childPath));
            }
            else {
                promises.add(this.#addDirectoryRecursive(currentDir, key, stringOrDir, childPath));
            }
        }
        await Promise.all(promises);
    }
    async #addDirectoryRecursive(currentDir, childDirName, childDirRecord, pathToEntry) {
        const childDir = await currentDir.getDirectoryHandle(childDirName, { create: true });
        await this.#addRecordsRecursive(childDir, childDirRecord, pathToEntry);
    }
    async #addFileShallow(currentDir, fileLeafName, contents, childPath) {
        const fileHandle = await currentDir.getFileHandle(fileLeafName, { create: true });
        const syncAccessHandle = await this.#requireSyncAccessHandle(childPath, fileHandle);
        FileSystemUtilities.writeContents(syncAccessHandle, contents);
    }
    async exportDirectoryRecord() {
        throw new Error("Method not implemented.");
        /*
        const packages: DirectoryRecord = {}, urls: { [key: string]: DirectoryRecord } = {};
        return { packages, urls };
        */
    }
    getIndex() {
        throw new Error("Method not implemented.");
    }
    createDirDeep(pathToDir) {
        throw new Error("Method not implemented.");
    }
    readFileDeep(pathToFile) {
        throw new Error("Method not implemented.");
    }
    writeFileDeep(pathToFile, contents) {
        throw new Error("Method not implemented.");
    }
    removeEntry(pathToEntry) {
        throw new Error("Method not implemented.");
    }
    terminate() {
        for (const pathToFile of this.#syncAccessMap.keys()) {
            this.#closeAndDeleteSyncAccessHandle(pathToFile);
        }
        return Promise.resolve();
    }
}
