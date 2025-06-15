import {
  WebFSParentNode
} from "./WebFSParentNode.js";

import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSNodeBaseIfc,
  WebFSParentNodeIfc,
  WebFSRootIfc,
} from "./types/WebFileSystem.js";

export class WebFSSubRoot<
  FileType extends WebFSFileType.PACKAGE | WebFSFileType.URL
>
extends WebFSParentNode
implements WebFSNodeBaseIfc<FileType>, WebFSParentNodeIfc
{
  // WebFSNodeBaseIfc
  readonly fileType: FileType;

  protected readonly root: WebFSRootIfc;

  constructor(
    fileType: FileType,
    root: WebFSRootIfc
  )
  {
    super();
    this.fileType = fileType;
    this.root = root;
  }
}
