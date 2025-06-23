export class FileSystemClipboard {
    #topDir;
    constructor(topDir) {
        this.#topDir = topDir;
    }
    getCurrent() {
        throw new Error("Method not implemented.");
    }
    copyFrom(sourceDirectory, name) {
        throw new Error("Method not implemented.");
    }
    copyTo(sourceDirectory) {
        throw new Error("Method not implemented.");
    }
    clear() {
        throw new Error("Method not implemented.");
    }
}
