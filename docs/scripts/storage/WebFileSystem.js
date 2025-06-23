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
    static #pathHeadRE = /^([^\/]+)\//;
    #key;
    #description;
    #fsManager;
    // WebFileSystemIfc
    packagesDir;
    // WebFileSystemIfc
    urlsDir;
    constructor(key, description, packagesDir, urlsDir, fsManager) {
        this.#key = key;
        this.#description = description;
        this.packagesDir = packagesDir;
        this.urlsDir = urlsDir;
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
    async getWebFilesMap() {
        const packagesMap = new AwaitedMap;
        const urlsMap = new AwaitedMap;
        await Promise.all([
            this.#fillFileMap("", packagesMap, this.packagesDir, false),
            this.#fillFileMap("", urlsMap, this.urlsDir, false),
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
            this.#fillFileMap("packages", pendingFilesMap, this.packagesDir, true),
            this.#fillFileMap("urls", pendingFilesMap, this.urlsDir, true)
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
        const promiseArray = [];
        for (let [pathToFile, handle] of entries) {
            if (mustJoinDirs || (currentDirectory !== this.urlsDir && currentDirectory !== this.packagesDir)) {
                pathToFile = prefix + "/" + pathToFile;
            }
            else if (currentDirectory === this.urlsDir) {
                pathToFile += ":/";
            }
            if (handle instanceof FileSystemFileHandle) {
                const promise = handle.getFile().then(file => file.text());
                promiseArray.push(promise);
                pendingFileMap.set(pathToFile, promise);
            }
            else if (handle instanceof FileSystemDirectoryHandle) {
                promiseArray.push(this.#fillFileMap(pathToFile, pendingFileMap, handle, true));
            }
            else {
                throw new Error("path is neither a file nor a directory?  How?  " + pathToFile);
            }
        }
        await Promise.all(promiseArray);
    }
    async importFilesMap(map) {
        const pendingDirsMap = new AwaitedMap([
            ["packages", Promise.resolve(this.packagesDir)],
            ["urls", Promise.resolve(this.urlsDir)]
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
