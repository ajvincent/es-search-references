import {
  OrderedStringMap
} from "../utilities/OrderedStringMap.js";

import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSNodeBaseIfc,
  WebFSDirectoryIfc,
  WebFSFileIfc,
  WebFSParentNodeIfc,
} from "./types/WebFileSystem.js";

export class WebFSSubRoot<
  FileType extends WebFSFileType.PACKAGE | WebFSFileType.URL
>
implements WebFSNodeBaseIfc<FileType>, WebFSParentNodeIfc
{
  readonly fileType: FileType;
  readonly #children = new OrderedStringMap<WebFSDirectoryIfc | WebFSFileIfc>;
  readonly children: ReadonlyMap<string, WebFSDirectoryIfc | WebFSFileIfc> = this.#children;

  constructor(fileType: FileType) {
    this.fileType = fileType;
  }
}
