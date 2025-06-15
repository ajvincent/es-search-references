import {
  OrderedStringMap
} from "../utilities/OrderedStringMap.js";

import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSFileIfc,
  WebFSParentNodeIfc,
  WebFSParentNodeAlias,
  WebFSRootIfc,
} from "./types/WebFileSystem.js";

export abstract class WebFSParentNode implements WebFSParentNodeIfc {
  readonly #children = new OrderedStringMap<WebFSDirectoryIfc | WebFSFileIfc>;
  readonly children: ReadonlyMap<string, WebFSDirectoryIfc | WebFSFileIfc> = this.#children;

  protected readonly abstract root: WebFSRootIfc;
  readonly abstract fileType: WebFSFileType.DIR | WebFSFileType.PACKAGE | WebFSFileType.URL;

  insertChild(childEntry: WebFSDirectoryIfc | WebFSFileIfc): void {
    if (this.#children.has(childEntry.localName)) {
      throw new Error("child entry already set: " + childEntry.localName);
    }

    this.#children.set(childEntry.localName, childEntry);
    childEntry.parentFileEntry = this as WebFSParentNodeAlias;
    if (childEntry.fileType === WebFSFileType.FILE)
      childEntry.root = this.root;
    this.root.childInserted(childEntry);
  }

  removeChild(childEntry: WebFSDirectoryIfc | WebFSFileIfc): void {
    if (!this.#children.has(childEntry.localName)) {
      throw new Error("child entry not set: " + childEntry.localName);
    }

    this.#children.delete(childEntry.localName);
    childEntry.parentFileEntry = undefined;
    this.root.childRemoved(childEntry);
  }

  renameChild(childEntry: WebFSDirectoryIfc | WebFSFileIfc, newName: string): void {
    if (!this.#children.has(childEntry.localName)) {
      throw new Error("child entry not set: " + childEntry.localName);
    }

    this.#children.delete(childEntry.localName);
    childEntry.localName = newName;
    this.#children.set(newName, childEntry);
    this.root.childRenamed(childEntry);
  }
}