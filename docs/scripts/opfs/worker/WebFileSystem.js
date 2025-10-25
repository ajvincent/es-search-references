var _a;
import { AwaitedMap } from "../../utilities/AwaitedMap.js";
import { DirectoryWorker, GET_ROOT_DIR_METHOD, SEARCH_PARAMS } from "./DirectoryWorker.js";
import { FileSystemClipboard } from "./FileSystemClipboard.js";
import { FileSystemUtilities } from "./FSUtilities.js";
import { URLDirHandle } from "./URLDirHandle.js";
const WorkerGlobal = self;
export class OPFSWebFileSystemWorker extends DirectoryWorker {
    static async build() {
        const topDir = await DirectoryWorker[GET_ROOT_DIR_METHOD]();
        const [packagesDir, urlsDir] = await Promise.all([
            topDir.getDirectoryHandle("packages", { create: true }),
            topDir.getDirectoryHandle("urls", { create: true })
        ]);
        let rootDir = await WorkerGlobal.navigator.storage.getDirectory();
        const clipboardDir = await this.#getDirectoryDeep(rootDir, this[SEARCH_PARAMS].get("pathToClipboardDir").split("/"), true);
        const clipboard = new FileSystemClipboard(clipboardDir);
        void (new _a(packagesDir, new URLDirHandle(urlsDir), clipboard));
        WorkerGlobal.postMessage("initialized");
    }
    static #getPathSequence(pathToEntry) {
        if (URL.canParse(pathToEntry)) {
            const { protocol, hostname, pathname } = URL.parse(pathToEntry);
            return [protocol + "//", hostname, ...pathname.substring(1).split("/")].filter(Boolean);
        }
        if (pathToEntry == "")
            return [];
        return pathToEntry.split("/");
    }
    static async #getDirectoryDeep(currentDir, pathSequence, create) {
        const options = { create };
        for (const part of pathSequence) {
            currentDir = await currentDir.getDirectoryHandle(part, options);
        }
        return currentDir;
    }
    static #fileEntryComparator(a, b) {
        return a[0].localeCompare(b[0]);
    }
    #packagesDir;
    #urlsDir;
    #clipboard;
    constructor(packagesDir, urlsDir, clipboard) {
        super();
        this.#packagesDir = packagesDir;
        this.#urlsDir = urlsDir;
        this.#clipboard = clipboard;
    }
    // OPFSWebFileSystemIfc
    async getWebFilesRecord() {
        const entries = [];
        async function callback(pathToEntry, entry) {
            if (entry.kind === "file")
                entries.push([pathToEntry, await FileSystemUtilities.readFile(entry)]);
        }
        await FileSystemUtilities.directoryTraversal("", true, this.#packagesDir, callback);
        for await (const [protocol, dirEntry] of this.#urlsDir.entries()) {
            await FileSystemUtilities.directoryTraversal(protocol, true, dirEntry, callback);
        }
        return Promise.resolve(Object.fromEntries(entries));
    }
    // OPFSWebFileSystemIfc
    async importDirectoryRecord(dirRecord) {
        let promisesSet = new Set;
        promisesSet.add(this.#addRecordsRecursive(this.#packagesDir, dirRecord.packages, ""));
        promisesSet.add(this.#addRecordsRecursive(this.#urlsDir.rawDirectory, dirRecord.urls, ""));
        await Promise.all(promisesSet);
    }
    async #addRecordsRecursive(currentDir, dirRecord, pathToEntry) {
        const promises = new Set;
        for (const [key, stringOrDir] of Object.entries(dirRecord)) {
            const childPath = pathToEntry ? pathToEntry + "/" + key : key;
            if (typeof stringOrDir === "string") {
                promises.add(this.#addFileShallow(currentDir, key, stringOrDir));
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
    async #addFileShallow(currentDir, fileLeafName, contents) {
        const fileHandle = await currentDir.getFileHandle(fileLeafName, { create: true });
        await FileSystemUtilities.writeFile(fileHandle, contents);
    }
    // OPFSWebFileSystemIfc
    async exportDirectoryRecord() {
        const [packages, urlsRaw] = await Promise.all([
            this.#exportDirectoryRecordRecursive(this.#packagesDir, true),
            this.#exportDirectoryRecordRecursive(this.#urlsDir.rawDirectory, true)
        ]);
        const urls = urlsRaw;
        return { packages, urls };
    }
    async #exportDirectoryRecordRecursive(dirHandle, readFiles) {
        const fileEntries = await Array.fromAsync(dirHandle.entries());
        fileEntries.sort(_a.#fileEntryComparator);
        const map = new AwaitedMap;
        for (const [leafName, entry] of fileEntries) {
            if (entry.kind === "directory")
                map.set(leafName, this.#exportDirectoryRecordRecursive(entry, readFiles));
            else if (readFiles)
                map.set(leafName, FileSystemUtilities.readFile(entry));
            else
                map.set(leafName, Promise.resolve(""));
        }
        return Object.fromEntries(await map.allResolved());
    }
    // OPFSWebFileSystemIfc
    async getIndex() {
        const [packageIndex, urlsIndex] = await Promise.all([
            this.#exportDirectoryRecordRecursive(this.#packagesDir, false),
            this.#exportDirectoryRecordRecursive(this.#urlsDir, false)
        ]);
        for (const [key, entry] of Object.entries(urlsIndex)) {
            packageIndex[key] = entry;
        }
        return packageIndex;
    }
    // OPFSWebFileSystemIfc
    async createDirDeep(pathToDir) {
        const pathSequence = _a.#getPathSequence(pathToDir);
        await _a.#getDirectoryDeep(URL.canParse(pathToDir) ? this.#urlsDir : this.#packagesDir, pathSequence, true);
    }
    // OPFSWebFileSystemIfc
    async readFileDeep(pathToFile) {
        const fileHandle = await this.#getFileDeep(pathToFile, false);
        return FileSystemUtilities.readFile(fileHandle);
    }
    // OPFSWebFileSystemIfc
    async writeFileDeep(pathToFile, contents) {
        const fileHandle = await this.#getFileDeep(pathToFile, true);
        return FileSystemUtilities.writeFile(fileHandle, contents);
    }
    async #getFileDeep(pathToFile, create) {
        const pathSequence = _a.#getPathSequence(pathToFile);
        const leafName = pathSequence.pop();
        const dirHandle = await _a.#getDirectoryDeep(URL.canParse(pathToFile) ? this.#urlsDir : this.#packagesDir, pathSequence, create);
        return await dirHandle.getFileHandle(leafName, { create });
    }
    // OPFSWebFileSystemIfc
    async removeEntryDeep(pathToEntry) {
        const pathSequence = _a.#getPathSequence(pathToEntry);
        const leafName = pathSequence.pop();
        const dirHandle = await _a.#getDirectoryDeep(URL.canParse(pathToEntry) ? this.#urlsDir : this.#packagesDir, pathSequence, false);
        return dirHandle.removeEntry(leafName, { recursive: true });
    }
    listDirectoryMembers(pathToDir) {
        return this.#listMembers(pathToDir, false);
    }
    listSiblingMembers(pathToFile) {
        return this.#listMembers(pathToFile, true);
    }
    async #listMembers(pathToFile, useParent) {
        const pathSequence = _a.#getPathSequence(pathToFile);
        if (useParent)
            pathSequence.pop();
        const dirHandle = await _a.#getDirectoryDeep(URL.canParse(pathToFile) ? this.#urlsDir : this.#packagesDir, pathSequence, false);
        const keys = await Array.fromAsync(dirHandle.keys());
        keys.sort();
        return keys;
    }
    async listProtocols() {
        const keys = await Array.fromAsync(this.#urlsDir.keys());
        keys.sort();
        return keys;
    }
    // OPFSWebFileSystemIfc
    async getClipboardIndex() {
        const clipboardDir = await this.#clipboard.getCurrent();
        if (clipboardDir)
            return this.#exportDirectoryRecordRecursive(clipboardDir, false);
        return {};
    }
    // OPFSWebFileSystemIfc
    async copyFromClipboard(pathToDir) {
        const pathSequence = _a.#getPathSequence(pathToDir);
        const dirHandle = await _a.#getDirectoryDeep(URL.canParse(pathToDir) ? this.#urlsDir : this.#packagesDir, pathSequence, false);
        if (dirHandle === this.#urlsDir)
            return this.#clipboard.copyTo(this.#urlsDir.rawDirectory);
        return this.#clipboard.copyTo(dirHandle);
    }
    // OPFSWebFileSystemIfc
    async copyToClipboard(pathToEntry) {
        const pathSequence = _a.#getPathSequence(pathToEntry);
        const leafName = pathSequence.pop();
        const dirHandle = await _a.#getDirectoryDeep(URL.canParse(pathToEntry) ? this.#urlsDir : this.#packagesDir, pathSequence, false);
        if (dirHandle === this.#urlsDir)
            return this.#clipboard.copyFrom(this.#urlsDir.rawDirectory, leafName.substring(0, leafName.length - 3));
        return this.#clipboard.copyFrom(dirHandle, leafName);
    }
    async readClipboardFile(pathToFile) {
        const pathSequence = _a.#getPathSequence(pathToFile);
        const leafName = pathSequence.pop();
        const clipboardDir = (await this.#clipboard.getCurrent());
        if (!clipboardDir)
            throw new Error("no clipboard directory found");
        const dirHandle = await _a.#getDirectoryDeep(clipboardDir, pathSequence, false);
        const fileHandle = await dirHandle.getFileHandle(leafName, { create: false });
        return FileSystemUtilities.readFile(fileHandle);
    }
    // OPFSWebFileSystemIfc
    clearClipboard() {
        return this.#clipboard.clear();
    }
    // OPFSWebFileSystemIfc
    terminate() {
        return Promise.resolve();
    }
}
_a = OPFSWebFileSystemWorker;
await OPFSWebFileSystemWorker.build();
