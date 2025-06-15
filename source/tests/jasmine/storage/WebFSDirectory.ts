import {
  WebFSDirectory
} from "../../../scripts/storage/WebFSDirectory.js";

import {
  StubWebFsDir
} from "../helpers/StubWebFSDir.js";

import {
  StubWebFSRoot
} from "../helpers/StubWebFSRoot.js";

describe("WebFSDirectory", () => {
  let root: StubWebFSRoot;
  beforeEach(() => root = new StubWebFSRoot);

  it("we can build with the package parent", () => {
    const dir = new WebFSDirectory("es-search-references", root.packages, root);
    expect(dir.localName).toBe("es-search-references");
    expect(dir.fullPath).toBe("es-search-references");
    expect(dir.parentFileEntry).toBe(root.packages);

    expect(root.packages.children.size).toBe(0);
  });

  it("we can build with the url parent", () => {
    const dir = new WebFSDirectory("virtual://", root.urls, root);
    expect(dir.localName).toBe("virtual://");
    expect(dir.fullPath).toBe("virtual://");
    expect(dir.parentFileEntry).toBe(root.urls);

    expect(root.urls.children.size).toBe(0);
  });

  it("we can build with another directory parent", () => {
    const parentDir = new StubWebFsDir("wop");
    const dir = new WebFSDirectory(parentDir.fullPath + "/wop", parentDir, root);
    expect(dir.localName).toBe("wop");
    expect(dir.fullPath).toBe(parentDir.fullPath + "/wop");
    expect(dir.parentFileEntry).toBe(parentDir);

    expect(parentDir.children.size).toBe(0);
  });
});
