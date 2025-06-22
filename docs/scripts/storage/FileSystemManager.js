import { AsyncJSONMap } from "./AsyncJSONMap.js";
import { WebFileSystem } from "./WebFileSystem.js";
export class FileSystemManager {
    static async build(topDir) {
        const systemsDir = await topDir.getDirectoryHandle("filesystems", { create: true });
        const indexFile = await topDir.getFileHandle("index.json", { create: true });
        const indexMap = await AsyncJSONMap.build(indexFile);
        return new FileSystemManager(systemsDir, indexMap);
    }
    #systemsDir;
    #indexMap;
    #descriptionsSet;
    #cache = new Map;
    constructor(systemsDir, indexMap) {
        this.#systemsDir = systemsDir;
        this.#indexMap = indexMap;
        this.#descriptionsSet = new Set(indexMap.values());
    }
    // FileSystemManagerIfc
    get availableSystems() {
        return this.#indexMap;
    }
    // FileSystemManagerIfc
    buildEmpty(description) {
        if (this.#descriptionsSet.has(description))
            return Promise.reject(new Error("duplicate description: " + description));
        const key = window.crypto.randomUUID();
        const promise = this.#createManager(key, description, true);
        this.#cache.set(key, promise);
        return this.setDescription(key, description).then(() => promise);
    }
    // FileSystemManagerIfc
    getExisting(key) {
        if (this.#cache.has(key)) {
            return this.#cache.get(key);
        }
        const description = this.#indexMap.get(key);
        if (description === undefined)
            return Promise.reject(new Error("unknown key: " + key));
        const promise = this.#createManager(key, description, true);
        this.#cache.set(key, promise);
        return promise;
    }
    async #createManager(key, description, create) {
        const webFilesDir = await this.#systemsDir.getDirectoryHandle(key, { create });
        const packagesPromise = webFilesDir.getDirectoryHandle("packages", { create });
        const urlsPromise = webFilesDir.getDirectoryHandle("urls", { create });
        const [packagesDir, urlsDir] = await Promise.all([packagesPromise, urlsPromise]);
        return new WebFileSystem(key, description, packagesDir, urlsDir, this);
    }
    // FSManagerInternalIfc
    async setDescription(key, newDescription) {
        const oldDescription = this.#indexMap.get(key);
        if (typeof oldDescription !== "undefined")
            this.#descriptionsSet.delete(oldDescription);
        this.#indexMap.set(key, newDescription);
        await this.#indexMap.commit();
        this.#descriptionsSet.add(newDescription);
    }
    // FSManagerInternalIfc
    async remove(key) {
        if (!this.#indexMap.has(key))
            throw new Error("key not found: " + key);
        const description = this.#indexMap.get(key);
        this.#descriptionsSet.delete(description);
        this.#indexMap.delete(key);
        this.#cache.delete(key);
        await this.#indexMap.commit();
        await this.#systemsDir.removeEntry(key, { recursive: true });
    }
}
