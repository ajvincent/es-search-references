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
  readonly packages = new WebFSSubRoot(WebFSFileType.PACKAGE);
  readonly urls = new WebFSSubRoot(WebFSFileType.URL);

  #webFileSet: CompactWebFileSet;

  constructor(
    isReadonly: boolean,
    webFileSet: CompactWebFileSet
  )
  {
    this.isReadonly = isReadonly;
    this.#webFileSet = webFileSet;

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
    fileStructureChanged: boolean,
    fileNode: WebFSDirectoryIfc | WebFSNodeIfc
  ): void
  {
    throw new Error("Method not implemented.");
  }
}
