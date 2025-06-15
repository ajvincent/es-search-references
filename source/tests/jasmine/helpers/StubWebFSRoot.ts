import {
  WebFSFileType
} from "../../../scripts/storage/constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSFileIfc,
  WebFSNodeIfc,
  WebFSRootIfc,
} from "../../../scripts/storage/types/WebFileSystem.js";

import {
  StubWebFSSubRoot
} from "./StubWebFSSubRoot.js";

export class StubWebFSRoot implements WebFSRootIfc {
  isReadonly = false;
  packages = new StubWebFSSubRoot(WebFSFileType.PACKAGE);
  urls = new StubWebFSSubRoot(WebFSFileType.URL);

  markDirty: jasmine.Spy<(
    fileNode: WebFSNodeIfc
  ) => void> = jasmine.createSpy();

  childInserted: jasmine.Spy<(
    childEntry: WebFSDirectoryIfc | WebFSFileIfc
  ) => void> = jasmine.createSpy();
  childRemoved: jasmine.Spy<(
    childEntry: WebFSDirectoryIfc | WebFSFileIfc
  ) => void> = jasmine.createSpy();
  childRenamed: jasmine.Spy<(
    childEntry: WebFSDirectoryIfc | WebFSFileIfc
  ) => void> = jasmine.createSpy();
}
