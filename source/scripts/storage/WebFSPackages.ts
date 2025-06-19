import {
  WebFSParentNode
} from "./WebFSDirectory.js";

import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSNodeBaseIfc,
  WebFSParentNodeIfc,
} from "./types/WebFileSystem.js";

export class WebFSPackages extends WebFSParentNode
implements WebFSNodeBaseIfc<WebFSFileType.PACKAGE>, WebFSParentNodeIfc
{
  // WebFSNodeBaseIfc
  readonly fileType = WebFSFileType.PACKAGE;

  constructor(directories: WebFSDirectoryIfc) {
    super();
    this.adoptChildren(Array.from(directories.children.entries()));
  }
}
