import {
  WebFSFile
} from "../../../scripts/storage/WebFSFile.js";

import type {
  WebFSParentNodeAlias,
} from "../../../scripts/storage/types/WebFileSystem.js"

import {
  StubWebFsDir
} from "../helpers/StubWebFSDir.js";

import {
  StubWebFSRoot
} from "../helpers/StubWebFSRoot.js";

describe("WebFileFS", () => {
  const contents = "//hello world\n";
  const leaf = "bar.js";

  let webFile: WebFSFile;

  describe("without an initial parent file", () => {
    const fullPath = "virtual://foo/bar/foo/bar.js";

    beforeEach(() => webFile = new WebFSFile(fullPath, contents, undefined));

    it("instances reflect the constructor", () => {
      expect(webFile.localName).toBe(leaf);
      expect(webFile.fullPath).toBe(fullPath);
      expect(webFile.contents).toBe(contents);
      expect(webFile.parentFileEntry).toBeUndefined();
    });

    it("can set the root, once", () => {
      const fs1 = new StubWebFSRoot, fs2 = new StubWebFSRoot;
      webFile.root = fs1;
      expect(
        () => webFile.root = fs2
      ).toThrowError("we already have a root, what are you doing?");

      expect(
        () => webFile.root = fs1
      ).not.toThrow();

      // getter is not defined
      expect(webFile.root).toBeUndefined();

      expect(fs1.markDirty).toHaveBeenCalledTimes(0);
    });

    it("can set the localname", () => {
      webFile.localName = "foo.js";
      expect(webFile.localName).toBe("foo.js");
      expect(webFile.fullPath).toBe("virtual://foo/bar/foo/foo.js");
    });

    it("can set the parent file multiple times", () => {
      const dir1 = new StubWebFsDir("bar");
      const dir2 = new StubWebFsDir("wop");

      webFile.parentFileEntry = dir1;
      expect(webFile.localName).toBe("bar.js");
      expect(webFile.fullPath).toBe("virtual://foo/bar/bar/bar.js");
      expect(webFile.parentFileEntry).toBe(dir1);

      webFile.parentFileEntry = dir2;
      expect(webFile.localName).toBe("bar.js");
      expect(webFile.fullPath).toBe("virtual://foo/bar/wop/bar.js");
      expect(webFile.parentFileEntry).toBe(dir2);
    });

    it("notifies the root when the local name changes", () => {
      const fs1 = new StubWebFSRoot;
      webFile.root = fs1;

      webFile.localName = "wop.js";
      expect(fs1.markDirty).toHaveBeenCalledOnceWith(webFile);
    });

    it("notifies the root when the contents change", () => {
      const fs1 = new StubWebFSRoot;
      webFile.root = fs1;

      webFile.contents = "//goodbye\n";
      expect(fs1.markDirty).toHaveBeenCalledOnceWith(webFile);
      expect(webFile.contents).toBe("//goodbye\n");
    });

    it("does not notify the root when the parent file changes", () => {
      const fs1 = new StubWebFSRoot;
      webFile.root = fs1;

      const dir1 = new StubWebFsDir("bar");
      webFile.parentFileEntry = dir1;

      // changes to the parent come from the parent, not from here
      expect(fs1.markDirty).toHaveBeenCalledTimes(0);

      const dir2 = new StubWebFsDir("wop");
      webFile.parentFileEntry = dir2;
      expect(fs1.markDirty).toHaveBeenCalledTimes(0);
    });
  });

  describe("with an initial parent file", () => {
    let parentEntry: WebFSParentNodeAlias;
    const fullPath = "virtual://foo/bar/dir/bar.js";

    beforeEach(() => {
      parentEntry = new StubWebFsDir("dir");
      webFile = new WebFSFile(fullPath, contents, parentEntry);
    });

    it("instances reflect the constructor", () => {
      expect(webFile.localName).toBe(leaf);
      expect(webFile.fullPath).toBe(fullPath);
      expect(webFile.contents).toBe(contents);
      expect(webFile.parentFileEntry).toBe(parentEntry);

      expect(parentEntry.children.size).toBe(0);
    });

    it("can set the parent file later", () => {
      const dir2 = new StubWebFsDir("wop");

      webFile.parentFileEntry = dir2;
      expect(webFile.localName).toBe("bar.js");
      expect(webFile.fullPath).toBe("virtual://foo/bar/wop/bar.js");
      expect(webFile.parentFileEntry).toBe(dir2);

      expect(parentEntry.children.size).toBe(0);
    });
  });
});
