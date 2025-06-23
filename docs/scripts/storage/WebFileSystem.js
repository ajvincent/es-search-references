import { zip } from "../../lib/packages/fflate.js";
import { AwaitedMap } from "../utilities/AwaitedMap.js";
/** @internal */
export class WebFileSystem {
    static #fileComparator(a, b) {
        return a[0].localeCompare(b[0]);
    }
    static #encoder = new TextEncoder();
    static #createZipEntry(keyAndContents) {
        const [key, contents] = keyAndContents;
        return [key, WebFileSystem.#encoder.encode(contents)];
    }
    #key;
    #description;
    #fsManager;
    #packagesDir;
    #urlsDir;
    constructor(key, description, packagesDir, urlsDir, fsManager) {
        this.#key = key;
        this.#description = description;
        this.#packagesDir = packagesDir;
        this.#urlsDir = urlsDir;
        this.#fsManager = fsManager;
    }
    // WebFileSystemIfc
    get description() {
        return this.#description;
    }
    // WebFileSystemIfc
    async setDescription(newDesc) {
        await this.#fsManager.setDescription(this.#key, newDesc);
        this.#description = newDesc;
    }
    // WebFileSystemIfc
    getPackageEntries() {
        return this.#packagesDir.entries();
    }
    // WebFileSystemIfc
    getPackageFileHandle(name, options) {
        return this.#packagesDir.getFileHandle(name, options);
    }
    // WebFileSystemIfc
    getPackageDirectoryHandle(name, options) {
        return this.#packagesDir.getDirectoryHandle(name, options);
    }
    // WebFileSystemIfc
    removePackageEntry(name, options) {
        return this.#packagesDir.removeEntry(name, options);
    }
    // WebFileSystemIfc
    async *getURLEntries() {
        for await (const [name, handle] of this.#urlsDir.entries()) {
            yield [name + "://", handle];
        }
    }
    // WebFileSystemIfc
    getURLDirectoryHandle(name, options) {
        return this.#urlsDir.getDirectoryHandle(name.substring(0, name.length - 3), options);
    }
    // WebFileSystemIfc
    removeURLDirectory(name, options) {
        return this.#urlsDir.removeEntry(name.substring(0, name.length - 3), options);
    }
    // WebFileSystemIfc
    getDirectoryByResolvedPath(fullPath) {
        let startDirPromise;
        if (URL.canParse(fullPath)) {
            const { protocol, hostname, pathname } = URL.parse(fullPath);
            startDirPromise = this.#urlsDir.getDirectoryHandle(protocol.substring(0, protocol.length - 1));
            fullPath = hostname + pathname;
        }
        else {
            startDirPromise = Promise.resolve(this.#packagesDir);
        }
        return this.#getDirectoryRecursive(startDirPromise, fullPath.split("/"));
    }
    // WebFileSystemIfc
    async getFileByResolvedPath(fullPath) {
        const lastSlashIndex = fullPath.lastIndexOf("/");
        const parentPath = fullPath.substring(0, lastSlashIndex);
        const leaf = fullPath.substring(lastSlashIndex + 1);
        const dirHandle = await this.getDirectoryByResolvedPath(parentPath);
        return dirHandle.getFileHandle(leaf);
    }
    #getDirectoryRecursive(dirPromise, pathSequence) {
        for (const name of pathSequence) {
            dirPromise = dirPromise.then(dir => dir.getDirectoryHandle(name));
        }
        return dirPromise;
    }
    // WebFileSystemIfc
    async getWebFilesMap() {
        const packagesMap = new AwaitedMap;
        const urlsMap = new AwaitedMap;
        await Promise.all([
            this.#fillFileMap("", packagesMap, this.#packagesDir, false),
            this.#fillFileMap("", urlsMap, this.#urlsDir, false),
        ]);
        const [resolvedPackages, resolvedURLs] = await Promise.all([
            packagesMap.allResolved(),
            urlsMap.allResolved(),
        ]);
        const packageEntries = Array.from(resolvedPackages.entries());
        packageEntries.sort(WebFileSystem.#fileComparator);
        const urlEntries = Array.from(resolvedURLs.entries());
        urlEntries.sort(WebFileSystem.#fileComparator);
        return new Map([...packageEntries, ...urlEntries]);
    }
    async exportAsZip() {
        const pendingFilesMap = new AwaitedMap;
        await Promise.all([
            this.#fillFileMap("packages", pendingFilesMap, this.#packagesDir, true),
            this.#fillFileMap("urls", pendingFilesMap, this.#urlsDir, true)
        ]);
        const fileMap = await pendingFilesMap.allResolved();
        const fileEntries = Array.from(fileMap.entries());
        fileEntries.sort(WebFileSystem.#fileComparator);
        const zipEntries = fileEntries.map(WebFileSystem.#createZipEntry);
        const deferred = Promise.withResolvers();
        const resultFn = (err, zipped) => {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(zipped);
        };
        zip(Object.fromEntries(zipEntries), resultFn);
        const zipUint8 = await deferred.promise;
        return new File([zipUint8], "exported-files.zip", { type: "application/zip" });
    }
    async #fillFileMap(prefix, pendingFileMap, currentDirectory, mustJoinDirs) {
        const entries = await Array.fromAsync(currentDirectory.entries());
        const promiseSet = new Set;
        for (let [pathToFile, handle] of entries) {
            if (mustJoinDirs || (currentDirectory !== this.#urlsDir && currentDirectory !== this.#packagesDir)) {
                pathToFile = prefix + "/" + pathToFile;
            }
            else if (currentDirectory === this.#urlsDir) {
                pathToFile += ":/";
            }
            if (handle instanceof FileSystemFileHandle) {
                const promise = handle.getFile().then(file => file.text());
                promiseSet.add(promise);
                pendingFileMap.set(pathToFile, promise);
            }
            else if (handle instanceof FileSystemDirectoryHandle) {
                promiseSet.add(this.#fillFileMap(pathToFile, pendingFileMap, handle, true));
            }
            else {
                throw new Error("path is neither a file nor a directory?  How?  " + pathToFile);
            }
        }
        await Promise.all(promiseSet);
    }
    async importFilesMap(map) {
        const pendingDirsMap = new AwaitedMap([
            ["packages", Promise.resolve(this.#packagesDir)],
            ["urls", Promise.resolve(this.#urlsDir)]
        ]);
        const filePromises = new Set;
        for (const [filePath, contents] of map) {
            const fileParts = filePath.split("/");
            let sequence = fileParts.shift();
            if (sequence !== "packages" && sequence !== "urls")
                continue;
            const leafName = fileParts.pop();
            for (const part of fileParts) {
                sequence = this.#requireChildDirPromise(pendingDirsMap, sequence, part);
            }
            filePromises.add(this.#requireChildFilePromise(pendingDirsMap, sequence, leafName, contents));
        }
        await Promise.all(filePromises);
    }
    #requireChildDirPromise(pendingDirsMap, parentSequence, nextPart) {
        const nextSequence = parentSequence + "/" + nextPart;
        if (!pendingDirsMap.has(nextSequence)) {
            const dirPromise = pendingDirsMap.get(parentSequence);
            pendingDirsMap.set(nextSequence, dirPromise.then(dirHandle => dirHandle.getDirectoryHandle(nextPart, { create: true })));
        }
        return nextSequence;
    }
    async #requireChildFilePromise(pendingDirsMap, parentSequence, name, contents) {
        const dirHandle = await pendingDirsMap.get(parentSequence);
        const fileHandle = await dirHandle.getFileHandle(name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(contents);
        await writable.close();
    }
    // WebFileSystemIfc
    async remove() {
        return this.#fsManager.remove(this.#key);
    }
    // WebFileSystemIfc
    get clipboard() {
        return this.#fsManager.clipboard;
    }
}
