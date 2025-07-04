var _a;
import { FileSystemUtilities } from "./FSUtilities.js";
const WorkerGlobal = self;
export class FileSystemClipboard {
    static #indexFileName = ".index";
    static async build(topDir) {
        const clipboard = new _a(topDir);
        await clipboard.flushOtherDirectories();
        return clipboard;
    }
    #topDir;
    constructor(topDir) {
        this.#topDir = topDir;
    }
    async #getIndexFile() {
        return this.#topDir.getFileHandle(_a.#indexFileName, { create: true });
    }
    async #getIndexName() {
        try {
            const fileHandle = await this.#getIndexFile();
            const name = await FileSystemUtilities.readFile(fileHandle);
            return name === "" ? null : name;
        }
        catch (ex) {
            return Promise.resolve(null);
        }
    }
    async #writeIndexName(newIndexName) {
        const fileHandle = await this.#getIndexFile();
        await FileSystemUtilities.writeFile(fileHandle, newIndexName);
    }
    async flushOtherDirectories() {
        const currentDirName = await this.#getIndexName();
        const keys = new Set(await Array.fromAsync(this.#topDir.keys()));
        keys.delete(_a.#indexFileName);
        if (currentDirName)
            keys.delete(currentDirName);
        if (keys.size === 0)
            return;
        // This should in theory never happen...
        const promises = new Set;
        for (const key of keys) {
            promises.add(this.#topDir.removeEntry(key, { recursive: true }));
        }
        await Promise.all(promises);
    }
    async getCurrent() {
        const currentDirName = await this.#getIndexName();
        return currentDirName ? this.#topDir.getDirectoryHandle(currentDirName) : null;
    }
    async copyFrom(sourceDirectory, name) {
        const newClipboardName = WorkerGlobal.crypto.randomUUID();
        const clipboardDirectory = await this.#topDir.getDirectoryHandle(newClipboardName, { create: true });
        let child;
        try {
            child = await sourceDirectory.getDirectoryHandle(name, { create: false });
        }
        catch (ex) {
            child = await sourceDirectory.getFileHandle(name, { create: false });
        }
        if (child.kind === "directory")
            await FileSystemUtilities.copyDirectoryRecursive(sourceDirectory, name, clipboardDirectory);
        else {
            await FileSystemUtilities.copyFile(sourceDirectory, name, clipboardDirectory);
        }
        const oldClipboardName = await this.#getIndexName();
        await this.#writeIndexName(newClipboardName);
        if (oldClipboardName)
            this.#topDir.removeEntry(oldClipboardName, { recursive: true });
    }
    async copyTo(targetDirectory) {
        const clipboardName = await this.#getIndexName();
        if (clipboardName) {
            const clipboardDirectory = await this.#topDir.getDirectoryHandle(clipboardName);
            // there will be at most one child of the clipboard directory
            for await (const child of clipboardDirectory.values()) {
                if (child.kind === "directory")
                    await FileSystemUtilities.copyDirectoryRecursive(clipboardDirectory, child.name, targetDirectory);
                else
                    await FileSystemUtilities.copyFile(clipboardDirectory, child.name, targetDirectory);
            }
        }
    }
    async clear() {
        const clipboardName = await this.#getIndexName();
        if (clipboardName) {
            await this.#writeIndexName("");
            this.#topDir.removeEntry(clipboardName, { recursive: true });
        }
    }
}
_a = FileSystemClipboard;
