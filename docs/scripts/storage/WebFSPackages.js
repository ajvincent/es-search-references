import { WebFSParentNode } from "./WebFSDirectory.js";
import { WebFSFileType } from "./constants.js";
export class WebFSPackages extends WebFSParentNode {
    // WebFSNodeBaseIfc
    fileType = WebFSFileType.PACKAGE;
    constructor(directories) {
        super();
        this.adoptChildren(Array.from(directories.children.entries()));
    }
}
