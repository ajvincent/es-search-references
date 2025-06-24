var _a;
import { FileSystemUtilities } from "./FileSystemUtilities.js";
export class FileSystemClipboard {
    static async build(topDir) {
        const clipboard = new _a(topDir);
        await clipboard.flushOtherDirectories();
        return clipboard;
    }
    static #indexFileName = ".index";
    #topDir;
    constructor(topDir) {
        this.#topDir = topDir;
    }
    async #getIndexName() {
        try {
            const name = await FileSystemUtilities.readContents(this.#topDir, _a.#indexFileName);
            return name === "" ? null : name;
        }
        catch (ex) {
            return Promise.resolve(null);
        }
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
        const targetName = window.crypto.randomUUID();
        const targetDirectory = await this.#topDir.getDirectoryHandle(targetName, { create: true });
        await FileSystemUtilities.copyDirectoryRecursive(sourceDirectory, name, targetDirectory);
        const oldClipboardName = await this.#getIndexName();
        await FileSystemUtilities.writeContents(this.#topDir, _a.#indexFileName, targetName);
        if (oldClipboardName)
            this.#topDir.removeEntry(oldClipboardName, { recursive: true });
    }
    async copyTo(targetDirectory) {
        const clipboardName = await this.#getIndexName();
        if (clipboardName) {
            await FileSystemUtilities.copyDirectoryRecursive(this.#topDir, clipboardName, targetDirectory);
        }
    }
    async clear() {
        const clipboardName = await this.#getIndexName();
        if (clipboardName) {
            await FileSystemUtilities.writeContents(this.#topDir, _a.#indexFileName, "");
            this.#topDir.removeEntry(clipboardName, { recursive: true });
        }
    }
}
_a = FileSystemClipboard;
