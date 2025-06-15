import { OrderedStringMap } from "../utilities/OrderedStringMap.js";
import { getParentAndLeaf } from "../utilities/getParentAndLeaf.js";
import { WebFSFileType } from "./constants.js";
export class WebFSDirectory {
    #localName;
    #parentFile;
    #root;
    fileType = WebFSFileType.DIR;
    #children = new OrderedStringMap;
    children = this.#children;
    constructor(fullPath, parentFile, root) {
        this.#parentFile = parentFile;
        this.#root = root;
        const [parent, leaf] = getParentAndLeaf(fullPath);
        this.#localName = leaf;
    }
    // WebFSNodeBaseIfc
    get localName() {
        return this.#localName;
    }
    set localName(newName) {
        this.#localName = newName;
        this.#root.markDirty(false, this);
    }
    get fullPath() {
        if (this.#parentFile?.fileType !== WebFSFileType.DIR)
            return this.localName;
        const parentPath = this.#parentFile.fullPath;
        if (parentPath.endsWith("/"))
            return parentPath + this.localName;
        return parentPath + "/" + this.localName;
    }
    // WebFSChildNodeIfc
    get parentFileEntry() {
        return this.#parentFile;
    }
    set parentFileEntry(newParent) {
        this.#parentFile = newParent;
        this.#root.markDirty(true, this);
    }
}
