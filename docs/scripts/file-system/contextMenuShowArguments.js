import { AwaitedMap } from "../utilities/AwaitedMap.js";
export class FSContextMenuShowArguments {
    #event;
    #pathToFile;
    #isDirectory;
    #webFS;
    promise;
    constructor(event, pathToFile, isDirectory, webFS) {
        this.#event = event;
        this.#pathToFile = pathToFile;
        this.#isDirectory = isDirectory;
        this.#webFS = webFS;
        this.promise = this.#buildPromise();
    }
    async #buildPromise() {
        const promiseMap = new AwaitedMap();
        promiseMap.set("currentChildren", this.#currentChildrenPromise());
        promiseMap.set("currentSiblings", this.#currentSiblingsPromise());
        promiseMap.set("currentPackages", this.#currentPackagesPromise());
        promiseMap.set("currentURLs", this.#currentProtocolsPromise());
        const clipboardPromise = this.#clipboardPromise();
        const mapPromise = promiseMap.allResolved();
        const [map, clipboardContents] = await Promise.all([mapPromise, clipboardPromise]);
        let leafName;
        let pathIsProtocol;
        if (this.#pathToFile.endsWith("://")) {
            pathIsProtocol = true;
            leafName = this.#pathToFile;
        }
        else {
            pathIsProtocol = false;
            leafName = this.#pathToFile.replace(/^.*\//g, "");
        }
        const isReservedName = (this.#pathToFile == "es-search-references" ||
            this.#pathToFile == "es-search-references/guest");
        return {
            event: this.#event,
            pathToFile: this.#pathToFile,
            pathIsProtocol,
            leafName,
            isReservedName,
            isDirectory: this.#isDirectory,
            currentChildren: map.get("currentChildren"),
            currentSiblings: map.get("currentSiblings"),
            currentPackages: map.get("currentPackages"),
            currentProtocols: map.get("currentURLs"),
            clipboardContentFileName: clipboardContents?.key ?? "",
            clipboardContentIsDir: clipboardContents?.type === "directory",
        };
    }
    async #currentChildrenPromise() {
        let keys = [];
        if (this.#isDirectory) {
            keys = await this.#webFS.listDirectoryMembers(this.#pathToFile);
        }
        return new Set(keys);
    }
    async #currentSiblingsPromise() {
        let keys = [];
        if (this.#pathToFile.endsWith("://")) {
            keys = await this.#webFS.listProtocols();
        }
        else {
            keys = await this.#webFS.listSiblingMembers(this.#pathToFile);
        }
        return new Set(keys);
    }
    async #currentPackagesPromise() {
        const keys = await this.#webFS.listDirectoryMembers("");
        return new Set(keys);
    }
    async #currentProtocolsPromise() {
        const keys = await this.#webFS.listProtocols();
        return new Set(keys);
    }
    async #clipboardPromise() {
        const index = await this.#webFS.getClipboardIndex();
        const entries = Object.entries(index);
        if (entries.length === 0) {
            return null;
        }
        if (entries.length > 1) {
            throw new Error("assertion failure, clipboard should have at most one entry");
        }
        const [key, content] = entries[0];
        const type = (typeof content === "string") ? "file" : "directory";
        return { type, key };
    }
}
