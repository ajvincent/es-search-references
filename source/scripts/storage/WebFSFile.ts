import {
  getParentAndLeaf
} from "../utilities/getParentAndLeaf.js";

import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSFileIfc,
  WebFSParentNodeAlias,
  WebFSRootIfc,
} from "./types/WebFileSystem.js";

export class WebFSFile implements WebFSFileIfc {
  #contents: string;
  #localName: string;
  #initialParentPath: string;
  #parentFile: WebFSParentNodeAlias | undefined;

  /** This may initially be undefined for the restore-from-storage case. */
  #root: WebFSRootIfc | undefined;

  // WebFSNodeBaseIfc
  readonly fileType = WebFSFileType.FILE;

  constructor(
    fullPath: string,
    contents: string,
    parentFile: WebFSParentNodeAlias | undefined,
  )
  {
    this.#contents = contents;
    this.#parentFile = parentFile;
    this.#root = undefined;

    const [parent, leaf] = getParentAndLeaf(fullPath);
    this.#initialParentPath = parentFile ? "" : parent;
    this.#localName = leaf;
  }

  // WebFSNodeBaseIfc
  get localName(): string {
    return this.#localName;
  }

  set localName(newName: string) {
    this.#localName = newName;
    this.#root?.markDirty(false, this);
  }

  // WebFSNodeBaseIfc
  get fullPath(): string {
    let parentPath = this.#initialParentPath;
    if (this.#parentFile?.fileType === WebFSFileType.DIR)
      parentPath = this.#parentFile.fullPath;
    if (parentPath.endsWith("/"))
      return parentPath + this.localName;
    return parentPath + "/" + this.localName;
  }

  // WebFSFileIfc
  get contents(): string {
    return this.#contents;
  }

  set contents(newValue: string) {
    this.#contents = newValue;
    this.#root?.markDirty(false, this);
  }

  // WebFSChildNodeIfc
  get parentFileEntry(): WebFSParentNodeAlias | undefined {
    return this.#parentFile;
  }

  set parentFileEntry(newParent: WebFSParentNodeAlias) {
    const hadParent = Boolean(this.#parentFile);
    this.#parentFile = newParent;
    this.#initialParentPath = "";

    if (hadParent)
      this.#root?.markDirty(true, this);
  }

  // WebFSFileIfc
  set root(newRoot: WebFSRootIfc) {
    if (this.#root) {
      throw new Error("we already have a root, what are you doing?");
    }
    this.#root = newRoot;
  }
}
