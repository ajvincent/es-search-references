import {
  OrderedStringMap
} from "../utilities/OrderedStringMap.js";

import {
  getParentAndLeaf
} from "../utilities/getParentAndLeaf.js";

import {
  CompactWebFileSet
} from "./CompactWebFileSet.js";

import {
  WebFSSubRoot
} from "./WebFSSubRoot.js";

import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSFileIfc,
  WebFSNodeIfc,
  WebFSRootIfc,
} from "./types/WebFileSystem.js";

export class WebFSRoot implements WebFSRootIfc {
  readonly isReadonly: boolean;
  readonly packages: WebFSSubRoot<WebFSFileType.PACKAGE>;
  readonly urls: WebFSSubRoot<WebFSFileType.URL>;

  #webFileSet: CompactWebFileSet;

  constructor(
    isReadonly: boolean,
    webFileSet: CompactWebFileSet
  )
  {
    this.isReadonly = isReadonly;
    this.#webFileSet = webFileSet;
    this.packages = new WebFSSubRoot(WebFSFileType.PACKAGE, this);
    this.urls = new WebFSSubRoot(WebFSFileType.URL, this);

    for (const webFile of webFileSet) {
      this.#addFile(webFile);
    }
  }

  #addFile(webFile: WebFSFileIfc): void {
    if (webFile.parentFileEntry)
      throw new Error("webFile shouldn't have a parentFileEntry: " + webFile.fullPath);

    const subrootMap = URL.canParse(webFile.fullPath) ? this.urls : this.packages;
  }

  markDirty(
    fileNode: WebFSDirectoryIfc | WebFSNodeIfc
  ): void
  {
    throw new Error("Method not implemented.");
  }

  childInserted(childEntry: WebFSDirectoryIfc | WebFSFileIfc): void {
    throw new Error("Method not implemented.");
  }

  childRemoved(childEntry: WebFSDirectoryIfc | WebFSFileIfc): void {
    throw new Error("Method not implemented.");
  }

  childRenamed(childEntry: WebFSDirectoryIfc | WebFSFileIfc): void {
    throw new Error("Method not implemented.");
  }
}
