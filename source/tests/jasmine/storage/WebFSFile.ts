import {
  WebFSFile
} from "../../../scripts/storage/WebFSFile.js";

import {
  StubWebFsDir
} from "../helpers/StubWebFSDir.js";

import {
  StubWebFSRoot
} from "../helpers/StubWebFSRoot.js";

describe("WebFileFS", () => {
  const fullPath = "virtual://foo/bar/foo/bar.js";
  const contents = "//hello world\n";
  const leaf = "bar.js";

  let webFile: WebFSFile;

  describe("without an initial parent file", () => {
    beforeEach(() => webFile = new WebFSFile(fullPath, contents, undefined));

    it("instances reflect the constructor, without a parentFile", () => {
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
      ).toThrowError("we already have a root, what are you doing?");

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
      expect(fs1.markDirty).toHaveBeenCalledOnceWith(false, webFile);
    });

    it("notifies the root when the contents change", () => {
      const fs1 = new StubWebFSRoot;
      webFile.root = fs1;

      webFile.contents = "//goodbye\n";
      expect(fs1.markDirty).toHaveBeenCalledOnceWith(false, webFile);
      expect(webFile.contents).toBe("//goodbye\n");
    });

    it("notifies the root when the parent file changes after being initially set", () => {
      const fs1 = new StubWebFSRoot;
      webFile.root = fs1;

      const dir1 = new StubWebFsDir("bar");
      webFile.parentFileEntry = dir1;
      expect(fs1.markDirty).toHaveBeenCalledTimes(0);

      const dir2 = new StubWebFsDir("wop");
      webFile.parentFileEntry = dir2;
      expect(fs1.markDirty).toHaveBeenCalledOnceWith(true, webFile);
    });
  });

  describe("with an initial parent file", () => {
    xit("no tests yet", () => {
      expect(true).toBeFalse();
    });
  });
});
