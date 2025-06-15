import {
  WebFSFileType
} from "../../../scripts/storage/constants.js";

import type {
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

  markDirty: (
    fileStructureChanged: boolean,
    fileNode: WebFSNodeIfc
  ) => void = jasmine.createSpy();
}
