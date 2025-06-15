import {
  OrderedStringMap
} from "../utilities/OrderedStringMap.js";

import {
  getParentAndLeaf
} from "../utilities/getParentAndLeaf.js";

import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSFileIfc,
  WebFSParentNodeAlias,
  WebFSRootIfc,
} from "./types/WebFileSystem.js";

export class WebFSDirectory implements WebFSDirectoryIfc {
  #localName: string;
  #parentFile: WebFSParentNodeAlias;
  #root: WebFSRootIfc;

  readonly fileType = WebFSFileType.DIR;
  readonly #children = new OrderedStringMap<WebFSDirectoryIfc | WebFSFileIfc>;
  readonly children: ReadonlyMap<string, WebFSDirectoryIfc | WebFSFileIfc> = this.#children;

  constructor(
    fullPath: string,
    parentFile: WebFSParentNodeAlias,
    root: WebFSRootIfc
  )
  {
    this.#parentFile = parentFile;
    this.#root = root;

    const [parent, leaf] = getParentAndLeaf(fullPath);
    this.#localName = leaf;
  }

  // WebFSNodeBaseIfc
  get localName(): string {
    return this.#localName;
  }

  set localName(newName: string) {
    this.#localName = newName;
    this.#root.markDirty(false, this);
  }

  get fullPath(): string {
    if (this.#parentFile?.fileType !== WebFSFileType.DIR)
      return this.localName;

    const parentPath = this.#parentFile.fullPath;
    if (parentPath.endsWith("/"))
      return parentPath + this.localName;

    return parentPath + "/" + this.localName;
  }

  // WebFSChildNodeIfc
  get parentFileEntry(): WebFSParentNodeAlias | undefined {
    return this.#parentFile;
  }

  set parentFileEntry(newParent: WebFSParentNodeAlias) {
    this.#parentFile = newParent;
    this.#root.markDirty(true, this);
  }
}
