import { getParentAndLeaf } from "../utilities/getParentAndLeaf.js";
import { WebFSParentNode } from "./WebFSParentNode.js";
import { WebFSFileType } from "./constants.js";
export class WebFSDirectory extends WebFSParentNode {
    #localName;
    root;
    // WebFSNodeBaseIfc
    fileType = WebFSFileType.DIR;
    // WebFSChildNodeIfc
    parentFileEntry;
    constructor(fullPath, parentFile, root) {
        super();
        this.parentFileEntry = parentFile;
        this.root = root;
        const [parent, leaf] = getParentAndLeaf(fullPath);
        this.#localName = leaf;
    }
    // WebFSNodeBaseIfc
    get localName() {
        return this.#localName;
    }
    set localName(newName) {
        const oldName = this.#localName;
        this.#localName = newName;
        this.root.markDirty(this);
    }
    get fullPath() {
        if (this.parentFileEntry?.fileType !== WebFSFileType.DIR)
            return this.localName;
        const parentPath = this.parentFileEntry.fullPath;
        if (parentPath.endsWith("/"))
            return parentPath + this.localName;
        return parentPath + "/" + this.localName;
    }
}
