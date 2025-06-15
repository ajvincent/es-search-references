import {
  getParentAndLeaf
} from "../utilities/getParentAndLeaf.js";

import {
  WebFSParentNode
} from "./WebFSParentNode.js";

import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSFileIfc,
  WebFSParentNodeAlias,
  WebFSRootIfc,
} from "./types/WebFileSystem.js";

export class WebFSDirectory extends WebFSParentNode implements WebFSDirectoryIfc {
  #localName: string;
  protected readonly root: WebFSRootIfc;

  // WebFSNodeBaseIfc
  readonly fileType = WebFSFileType.DIR;

  // WebFSChildNodeIfc
  parentFileEntry: WebFSParentNodeAlias;

  constructor(
    fullPath: string,
    parentFile: WebFSParentNodeAlias,
    root: WebFSRootIfc
  )
  {
    super();
    this.parentFileEntry = parentFile;
    this.root = root;

    const [parent, leaf] = getParentAndLeaf(fullPath);
    this.#localName = leaf;
  }

  // WebFSNodeBaseIfc
  get localName(): string {
    return this.#localName;
  }

  set localName(newName: string) {
    const oldName = this.#localName;
    this.#localName = newName;
    this.root.markDirty(this);
  }

  get fullPath(): string {
    if (this.parentFileEntry?.fileType !== WebFSFileType.DIR)
      return this.localName;

    const parentPath = this.parentFileEntry.fullPath;
    if (parentPath.endsWith("/"))
      return parentPath + this.localName;

    return parentPath + "/" + this.localName;
  }
}
