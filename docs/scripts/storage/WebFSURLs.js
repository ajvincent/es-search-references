import { WebFSParentNode } from "./WebFSDirectory.js";
import { WebFSFileType } from "./constants.js";
export class WebFSURLs extends WebFSParentNode {
    // WebFSNodeBaseIfc
    fileType = WebFSFileType.URL;
    constructor(directories) {
        super();
        this.adoptChildren(Array.from(directories.children.entries()));
    }
    /*
    toZippable(): ZippableDirectories {
      const entries: [string, ZippableFileEntry][] = [];
  
      for (const [localName, fileEntry] of this.children.entries()) {
        entries.push([localName.replace(/:\/\/$/, ""), fileEntry.toZippable()]);
      }
  
      return Object.fromEntries(entries);
    }
    */
    adoptChildren(entries) {
        for (const entry of entries) {
            entry[0] += "://";
        }
        super.adoptChildren(entries);
    }
}
