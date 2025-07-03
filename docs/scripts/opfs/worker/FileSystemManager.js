import { DirectoryWorker, GET_ROOT_DIR_METHOD, } from "./DirectoryWorker.js";
import { JSONMap } from "./JSONMap.js";
const WorkerGlobal = self;
class OPFSFileSystemManagerWorker extends DirectoryWorker {
    static async build() {
        const topDir = await DirectoryWorker[GET_ROOT_DIR_METHOD]();
        const systemsDir = await topDir.getDirectoryHandle("filesystems", { create: true });
        const indexFile = await topDir.getFileHandle("index.json", { create: true });
        const indexSync = await indexFile.createSyncAccessHandle();
        const indexMap = new JSONMap(indexSync);
        void (new OPFSFileSystemManagerWorker(systemsDir, indexMap));
        WorkerGlobal.postMessage("initialized");
    }
    #systemsDir;
    #indexMap;
    #descriptionsSet;
    constructor(systemsDir, indexMap) {
        super();
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
        return key;
    }
    // OPFSFileSystemIfc
    setDescription(key, newDescription) {
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
        return Promise.resolve(null);
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
        return null;
    }
    // OPFSFileSystemIfc
    terminate() {
        this.#indexMap.close();
        return Promise.resolve();
    }
}
await OPFSFileSystemManagerWorker.build();
