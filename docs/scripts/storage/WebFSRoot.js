import { WebFSSubRoot } from "./WebFSSubRoot.js";
import { WebFSFileType } from "./constants.js";
export class WebFSRoot {
    isReadonly;
    packages;
    urls;
    #webFileSet;
    constructor(isReadonly, webFileSet) {
        this.isReadonly = isReadonly;
        this.#webFileSet = webFileSet;
        this.packages = new WebFSSubRoot(WebFSFileType.PACKAGE, this);
        this.urls = new WebFSSubRoot(WebFSFileType.URL, this);
        for (const webFile of webFileSet) {
            this.#addFile(webFile);
        }
    }
    #addFile(webFile) {
        if (webFile.parentFileEntry)
            throw new Error("webFile shouldn't have a parentFileEntry: " + webFile.fullPath);
        const subrootMap = URL.canParse(webFile.fullPath) ? this.urls : this.packages;
    }
    markDirty(fileNode) {
        throw new Error("Method not implemented.");
    }
    childInserted(childEntry) {
        throw new Error("Method not implemented.");
    }
    childRemoved(childEntry) {
        throw new Error("Method not implemented.");
    }
    childRenamed(childEntry) {
        throw new Error("Method not implemented.");
    }
}
