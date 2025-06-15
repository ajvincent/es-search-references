import { getParentAndLeaf } from "../utilities/getParentAndLeaf.js";
import { WebFSFileType } from "./constants.js";
export class WebFSFile {
    #contents;
    #localName;
    #initialParentPath;
    #parentFile;
    /** This may initially be undefined for the restore-from-storage case. */
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
        let parentPath = this.#initialParentPath;
        if (this.#parentFile?.fileType === WebFSFileType.DIR)
            parentPath = this.#parentFile.fullPath;
        if (parentPath.endsWith("/"))
            return parentPath + this.localName;
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
    get parentFileEntry() {
        return this.#parentFile;
    }
    set parentFileEntry(newParent) {
        const hadParent = Boolean(this.#parentFile);
        this.#parentFile = newParent;
        this.#initialParentPath = "";
        if (hadParent)
            this.#root?.markDirty(true, this);
    }
    // WebFSFileIfc
    set root(newRoot) {
        if (this.#root) {
            throw new Error("we already have a root, what are you doing?");
        }
        this.#root = newRoot;
    }
}
