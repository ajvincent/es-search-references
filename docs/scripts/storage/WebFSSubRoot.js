import { WebFSParentNode } from "./WebFSParentNode.js";
export class WebFSSubRoot extends WebFSParentNode {
    // WebFSNodeBaseIfc
    fileType;
    root;
    constructor(fileType, root) {
        super();
        this.fileType = fileType;
        this.root = root;
    }
}
