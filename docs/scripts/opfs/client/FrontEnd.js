import { OPFSFileSystemManagerClientImpl } from "./FileSystemManager.js";
import { OPFSWebFileSystemClientImpl } from "./WebFileSystem.js";
export class OPFSFrontEnd {
    static async build(pathToRootDir) {
        const manager = await OPFSFileSystemManagerClientImpl.build(pathToRootDir);
        return new OPFSFrontEnd(manager);
    }
    #isLive = true;
    #fsManager;
    #webFsMap = new Map;
    constructor(fsManager) {
        this.#fsManager = fsManager;
    }
    async getAvailableSystems() {
        if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
            throw new Error("this front end is dead");
        }
        return this.#fsManager.getAvailableSystems();
    }
    async getWebFS(key) {
        if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
            throw new Error("this front end is dead");
        }
        let webFS = this.#webFsMap.get(key);
        if (webFS)
            return webFS;
        const [pathToWebFiles, clipboardPath] = await Promise.all([
            this.#fsManager.getWebFSPath(key),
            this.#fsManager.getClipboardPath()
        ]);
        webFS = await OPFSWebFileSystemClientImpl.build(pathToWebFiles, clipboardPath);
        this.#webFsMap.set(key, webFS);
        return webFS;
    }
    async buildEmpty(description) {
        if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
            throw new Error("this front end is dead");
        }
        return this.#fsManager.buildEmpty(description);
    }
    async removeWebFS(key) {
        if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
            throw new Error("this front end is dead");
        }
        const webFS = this.#webFsMap.get(key);
        if (!webFS)
            return false;
        this.#webFsMap.delete(key);
        await webFS.terminate();
        await this.#fsManager.remove(key);
        return true;
    }
    async terminate() {
        if (!this.#isLive || !this.#fsManager || !this.#webFsMap) {
            throw new Error("this front end is dead");
        }
        this.#isLive = false;
        let promises = new Set;
        for (const webFS of this.#webFsMap.values()) {
            promises.add(webFS.terminate());
        }
        await Promise.all(promises);
        await this.#fsManager.terminate();
        this.#webFsMap = undefined;
        this.#fsManager = undefined;
    }
}
