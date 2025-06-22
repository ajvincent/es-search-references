import { AwaitedMap } from "../utilities/AwaitedMap.js";
/** @internal */
export class WebFileSystem {
    static #fileComparator(a, b) {
        return a[0].localeCompare(b[0]);
    }
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
            this.#fillFileMaps("", packagesMap, this.packagesDir),
            this.#fillFileMaps("", urlsMap, this.urlsDir),
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
    async #fillFileMaps(prefix, pendingFileMap, currentDirectory) {
        const entries = await Array.fromAsync(currentDirectory.entries());
        const promiseArray = [];
        for (let [pathToFile, handle] of entries) {
            if (currentDirectory === this.urlsDir) {
                pathToFile += ":/";
            }
            else if (currentDirectory !== this.packagesDir) {
                pathToFile = prefix + "/" + pathToFile;
            }
            if (handle instanceof FileSystemFileHandle) {
                const promise = handle.getFile().then(file => file.text());
                promiseArray.push(promise);
                pendingFileMap.set(pathToFile, promise);
            }
            else if (handle instanceof FileSystemDirectoryHandle) {
                promiseArray.push(this.#fillFileMaps(pathToFile, pendingFileMap, handle));
            }
            else {
                throw new Error("path is neither a file nor a directory?  How?  " + pathToFile);
            }
        }
        await Promise.all(promiseArray);
    }
    // WebFileSystemIfc
    async remove() {
        return this.#fsManager.remove(this.#key);
    }
}
