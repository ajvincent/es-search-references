import {
  WebFSFileType
} from "../../../scripts/storage/constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSFileIfc,
} from "../../../scripts/storage/types/WebFileSystem.js";

import {
  OrderedStringMap
} from "../../../scripts/utilities/OrderedStringMap.js";

export class StubWebFsDir implements WebFSDirectoryIfc {
  parentFileEntry = undefined;
  localName: string;
  fullPath: string;
  readonly fileType = WebFSFileType.DIR;
  children = new OrderedStringMap<WebFSDirectoryIfc | WebFSFileIfc>;

  constructor(localName: string) {
    this.localName = localName;
    this.fullPath = "virtual://foo/bar/" + localName;
  }
}
