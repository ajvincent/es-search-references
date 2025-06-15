import {
  WebFSFileType
} from "../../../scripts/storage/constants.js";

import type {
  WebFSNodeBaseIfc,
  WebFSDirectoryIfc,
  WebFSFileIfc,
  WebFSParentNodeIfc,
} from "../../../scripts/storage/types/WebFileSystem.js";

import {
  OrderedStringMap
} from "../../../scripts/utilities/OrderedStringMap.js";

export class StubWebFSSubRoot<
  FileType extends WebFSFileType.PACKAGE | WebFSFileType.URL
>
implements WebFSNodeBaseIfc<FileType>, WebFSParentNodeIfc
{
  readonly fileType: FileType;
  readonly children = new OrderedStringMap<WebFSDirectoryIfc | WebFSFileIfc>;

  constructor(fileType: FileType) {
    this.fileType = fileType;
  }

  insertChild: jasmine.Spy<(
    childEntry: WebFSDirectoryIfc | WebFSFileIfc
  ) => void> = jasmine.createSpy();
  removeChild: jasmine.Spy<(
    childEntry: WebFSDirectoryIfc | WebFSFileIfc
  ) => void> = jasmine.createSpy();
  renameChild: jasmine.Spy<(
    childEntry: WebFSDirectoryIfc | WebFSFileIfc,
    newName: string
  ) => void> = jasmine.createSpy();
}
