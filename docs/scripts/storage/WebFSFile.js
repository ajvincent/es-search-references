import { getParentAndLeaf } from "../utilities/getParentAndLeaf.js";
import { WebFSFileType } from "./constants.js";
export class WebFileFS {
    #contents;
    #localName;
    #initialParentPath;
    #parentFile;
    #root;
    // WebFSNodeBaseIfc
    fileType = WebFSFileType.FILE;
    constructor(fullPath, contents, parentFile) {
        this.#contents = contents;
        this.#parentFile = parentFile;
        this.#root = undefined;
        const [parent, leaf] = getParentAndLeaf(fullPath);
        this.#initialParentPath = parentFile ? "" : parent;
        this.#localName = leaf;
    }
    // WebFSNodeBaseIfc
    get localName() {
        return this.#localName;
    }
    set localName(newName) {
        this.#localName = newName;
        this.#root?.markDirty(false, this);
    }
    // WebFSNodeBaseIfc
    get fullPath() {
        const parentPath = this.#parentFile?.fullPath ?? this.#initialParentPath;
        return parentPath + "/" + this.localName;
    }
    // WebFSFileIfc
    get contents() {
        return this.#contents;
    }
    set contents(newValue) {
        this.#contents = newValue;
        this.#root?.markDirty(false, this);
    }
    // WebFSChildNodeIfc
    get parentFile() {
        return this.#parentFile;
    }
    set parentFile(newParent) {
        this.#parentFile = newParent;
        this.#initialParentPath = "";
    }
    // WebFSFileIfc
    set root(newRoot) {
        if (this.#root) {
            throw new Error("we already have a root, what are you doing?");
        }
        this.#root = newRoot;
    }
}
