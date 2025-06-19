import {
  WebFSParentNode
} from "./WebFSDirectory.js";

import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSFileEntryIfc,
  WebFSFileIfc,
  WebFSNodeBaseIfc,
  WebFSParentNodeIfc,
  ZippableDirectories,
  ZippableFileEntry,
} from "./types/WebFileSystem.js";

export class WebFSURLs
extends WebFSParentNode
implements WebFSNodeBaseIfc<WebFSFileType.URL>, WebFSParentNodeIfc
{
  // WebFSNodeBaseIfc
  readonly fileType = WebFSFileType.URL;

  constructor(directories: WebFSDirectoryIfc) {
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

  protected adoptChildren(entries: [string, WebFSFileEntryIfc][]): void {
    for (const entry of entries) {
      entry[0] += "://";
    }
    super.adoptChildren(entries);
  }
}
