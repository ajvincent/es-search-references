import {
  WebFSFileType
} from "../../../scripts/storage/constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSFileIfc,
  WebFSParentNodeAlias,
} from "../../../scripts/storage/types/WebFileSystem.js";

import {
  OrderedStringMap
} from "../../../scripts/utilities/OrderedStringMap.js";

export class StubWebFsDir implements WebFSDirectoryIfc {
  parentFileEntry: WebFSParentNodeAlias | undefined = undefined;
  localName: string;
  fullPath: string;
  readonly fileType = WebFSFileType.DIR;
  readonly children = new OrderedStringMap<WebFSDirectoryIfc | WebFSFileIfc>;

  constructor(localName: string) {
    this.localName = localName;
    this.fullPath = "virtual://foo/bar/" + localName;
  }

  insertChild: jasmine.Spy<(childEntry: WebFSDirectoryIfc | WebFSFileIfc) => void> = jasmine.createSpy();
  removeChild: jasmine.Spy<(childEntry: WebFSDirectoryIfc | WebFSFileIfc) => void> = jasmine.createSpy();
  renameChild: jasmine.Spy<(childEntry: WebFSDirectoryIfc | WebFSFileIfc, newName: string) => void> = jasmine.createSpy();
}
