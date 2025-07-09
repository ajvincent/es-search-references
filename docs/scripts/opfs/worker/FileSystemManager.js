import { DirectoryWorker, GET_ROOT_DIR_METHOD, GET_ROOT_DIR_PATH, } from "./DirectoryWorker.js";
import { AsyncJSONMap } from "./AsyncJSONMap.js";
const WorkerGlobal = self;
class OPFSFileSystemManagerWorker extends DirectoryWorker {
    static async build() {
        const topDir = await DirectoryWorker[GET_ROOT_DIR_METHOD]();
        const [systemsDir, indexFile, clipboardDir] = await Promise.all([
            topDir.getDirectoryHandle("filesystems", { create: true }),
            topDir.getFileHandle("index.json", { create: true }),
            topDir.getDirectoryHandle("clipboard", { create: true }),
        ]);
        const indexMap = await AsyncJSONMap.build(indexFile);
        void (new OPFSFileSystemManagerWorker(topDir + "/filesystems", systemsDir, indexMap));
        void (clipboardDir);
        WorkerGlobal.postMessage("initialized");
    }
    #pathToSystemsDir;
    #systemsDir;
    #indexMap;
    #descriptionsSet;
    constructor(pathToSystemsDir, systemsDir, indexMap) {
        super();
        this.#pathToSystemsDir = pathToSystemsDir;
        this.#systemsDir = systemsDir;
        this.#indexMap = indexMap;
        this.#descriptionsSet = new Set(indexMap.values());
    }
    // OPFSFileSystemIfc
    getAvailableSystems() {
        return Promise.resolve(Object.fromEntries(this.#indexMap));
    }
    // OPFSFileSystemIfc
    async buildEmpty(newDescription) {
        newDescription = newDescription.trim();
        if (!newDescription) {
            throw new Error("whitespace descriptions not allowed");
        }
        if (this.#descriptionsSet.has(newDescription)) {
            throw new Error("description already exists");
        }
        const key = WorkerGlobal.crypto.randomUUID();
        await this.#systemsDir.getDirectoryHandle(key, { create: true });
        this.#indexMap.set(key, newDescription);
        this.#descriptionsSet.add(newDescription);
        await this.#indexMap.commit();
        return key;
    }
    // OPFSFileSystemIfc
    async setDescription(key, newDescription) {
        newDescription = newDescription.trim();
        if (!newDescription) {
            throw new Error("whitespace descriptions not allowed");
        }
        if (this.#descriptionsSet.has(newDescription)) {
            throw new Error("description already exists");
        }
        if (!this.#indexMap.has(key)) {
            throw new Error("key not found: " + key);
        }
        const oldDescription = this.#indexMap.get(key);
        this.#indexMap.set(key, newDescription);
        this.#descriptionsSet.delete(oldDescription);
        this.#descriptionsSet.add(newDescription);
        await this.#indexMap.commit();
        return null;
    }
    // OPFSFileSystemIfc
    async remove(key) {
        if (!this.#indexMap.has(key)) {
            throw new Error("key not found: " + key);
        }
        await this.#systemsDir.removeEntry(key, { recursive: true });
        const oldDescription = this.#indexMap.get(key);
        this.#indexMap.delete(key);
        this.#descriptionsSet.delete(oldDescription);
        await this.#indexMap.commit();
        return null;
    }
    // OPFSFileSystemIfc
    getWebFSPath(key) {
        return Promise.resolve(this.#pathToSystemsDir + "/" + key);
    }
    // OPFSFileSystemIfc
    getClipboardPath() {
        return Promise.resolve(OPFSFileSystemManagerWorker[GET_ROOT_DIR_PATH]() + "/clipboard");
    }
    // OPFSFileSystemIfc
    terminate() {
        return Promise.resolve();
    }
}
await OPFSFileSystemManagerWorker.build();
