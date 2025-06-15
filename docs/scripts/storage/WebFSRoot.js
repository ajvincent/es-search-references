import { WebFSSubRoot } from "./WebFSSubRoot.js";
import { WebFSFileType } from "./constants.js";
export class WebFSRoot {
    isReadonly;
    packages = new WebFSSubRoot(WebFSFileType.PACKAGE);
    urls = new WebFSSubRoot(WebFSFileType.URL);
    #webFileSet;
    constructor(isReadonly, webFileSet) {
        this.isReadonly = isReadonly;
        this.#webFileSet = webFileSet;
        for (const webFile of webFileSet) {
            this.#addFile(webFile);
        }
    }
    #addFile(webFile) {
        if (webFile.parentFileEntry)
            throw new Error("webFile shouldn't have a parentFileEntry: " + webFile.fullPath);
        const subrootMap = URL.canParse(webFile.fullPath) ? this.urls : this.packages;
    }
    markDirty(fileStructureChanged, fileNode) {
        throw new Error("Method not implemented.");
    }
}
