import { AwaitedMap } from "../utilities/AwaitedMap.js";
let SearchFilesTopDir;
{
    const rootDir = await navigator.storage.getDirectory();
    SearchFilesTopDir = await rootDir.getDirectoryHandle("es-search-references", { create: true });
}
/** @internal */
//FIXME: create AsyncMap and AsyncSet interfaces for this, so the map can be live.
class IndexManagerClass {
    #idToDescriptionMap;
    #descriptionValues;
    #fileHandle;
    idToDescriptionMap;
    descriptionValues;
    constructor(entries, fileHandle) {
        this.#idToDescriptionMap = new Map(entries);
        this.idToDescriptionMap = this.#idToDescriptionMap;
        this.#descriptionValues = new Set(this.#idToDescriptionMap.values());
        this.descriptionValues = this.#descriptionValues;
        this.#fileHandle = fileHandle;
    }
    async set(key, description) {
        const oldDescription = this.#idToDescriptionMap.get(key);
        if (typeof oldDescription !== "undefined") {
            this.#descriptionValues.delete(oldDescription);
        }
        this.#idToDescriptionMap.set(key, description);
        this.#descriptionValues.add(description);
        await this.#writeMap();
    }
    async delete(key) {
        const description = this.#idToDescriptionMap.get(key);
        if (typeof description === "undefined") {
            return false;
        }
        this.#idToDescriptionMap.delete(key);
        this.#descriptionValues.delete(description);
        await this.#writeMap();
        return true;
    }
    async #writeMap() {
        const writable = await this.#fileHandle.createWritable();
        await writable.write(JSON.stringify(Array.from(this.#idToDescriptionMap)));
        await writable.close();
    }
}
const IndexManager = await SearchFilesTopDir.getFileHandle("index.json", { create: true }).then(async (fileHandle) => {
    const file = await fileHandle.getFile();
    const text = await file.text();
    const entries = JSON.parse(text ?? "[]");
    return new IndexManagerClass(entries, fileHandle);
});
export class WebFileManager {
    static #cache = new AwaitedMap;
    /** this is so clients know what file systems they have available */
    static definedFileSystems = IndexManager.idToDescriptionMap;
    /** the known descriptions, so we don't reuse any */
    static descriptions = IndexManager.descriptionValues;
    /**
     *
     * @param description - the description to use
     * @param key - reserved keys only here please... most of the time you don't want this
     * @returns
     */
    static async buildEmpty(description, key) {
        if (IndexManager.descriptionValues.has(description))
            throw new Error("duplicate description");
        key ??= window.crypto.randomUUID();
        const managerPromise = this.#createManager(key, description, true);
        const manager = await managerPromise;
        await IndexManager.set(key, description);
        this.#cache.set(key, managerPromise);
        return manager;
    }
    static getExisting(key) {
        if (!this.#cache.has(key)) {
            this.#cache.set(key, this.#reviveById(key));
        }
        return this.#cache.get(key);
    }
    static async #reviveById(key) {
        const description = IndexManager.idToDescriptionMap.get(key);
        if (!description) {
            throw new Error("no match for key: " + key);
        }
        return this.#createManager(key, description, false);
    }
    static async #createManager(key, description, create) {
        const webFilesDir = await SearchFilesTopDir.getDirectoryHandle(key, { create });
        const packagesPromise = webFilesDir.getDirectoryHandle("packages", { create });
        const urlsPromise = webFilesDir.getDirectoryHandle("urls", { create });
        const [packagesDir, urlsDir] = await Promise.all([packagesPromise, urlsPromise]);
        return new WebFileManager(key, description, packagesDir, urlsDir);
    }
    #key;
    #description;
    packagesDir;
    urlsDir;
    get description() {
        return this.#description;
    }
    async setDescription(newDesc) {
        await IndexManager.set(this.#key, newDesc);
        this.#description = newDesc;
    }
    constructor(key, description, packagesDir, urlsDir) {
        this.#key = key;
        this.#description = description;
        this.packagesDir = packagesDir;
        this.urlsDir = urlsDir;
    }
    async getWebFilesMap() {
        throw new Error("not yet implemented");
    }
    async remove() {
        await WebFileManager.#cache.delete(this.#key);
        await IndexManager.delete(this.#key);
        await SearchFilesTopDir.removeEntry(this.#key, { recursive: true });
    }
}
