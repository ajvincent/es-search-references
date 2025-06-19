export class WebFSRoot {
    static fromJSON() {
        throw new Error("not yet implemented");
    }
    static fromZippable() {
        throw new Error("not yet implemented");
    }
    static buildEmpty() {
        throw new Error("not yet implemented");
    }
    isReadonly;
    #packages;
    #urls;
    constructor(isReadonly, packages, urls) {
        this.isReadonly = isReadonly;
        this.#packages = packages;
        this.#urls = urls;
    }
    getWebFilesMap() {
        throw new Error("Method not implemented.");
    }
}
