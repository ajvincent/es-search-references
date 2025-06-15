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

export class WebFileFS implements WebFSFileIfc {
  #contents: string;
  #localName: string;
  #initialParentPath: string;
  #parentFile: WebFSParentNodeAlias | undefined;
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
    const parentPath = this.#parentFile?.fullPath ?? this.#initialParentPath;
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
  get parentFile(): WebFSParentNodeAlias | undefined {
    return this.#parentFile;
  }

  set parentFile(newParent: WebFSParentNodeAlias) {
    this.#parentFile = newParent;
    this.#initialParentPath = "";
  }

  // WebFSFileIfc
  set root(newRoot: WebFSRootIfc) {
    if (this.#root) {
      throw new Error("we already have a root, what are you doing?");
    }
    this.#root = newRoot;
  }
}
