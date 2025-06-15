import {
  WebFSDirectory
} from "../../../scripts/storage/WebFSDirectory.js";

import {
  WebFSFile
} from "../../../scripts/storage/WebFSFile.js";

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

  describe("file manipulations:", () => {
    /* NOTE: Since WebFSSubRoot and WebFSDirectory both use the superclass
    WebFSParentNode and do not override the latter's methods, there is no need to
    test WebFSSubRoot. */

    let dir: WebFSDirectory;
    beforeEach(() => dir = new WebFSDirectory("virtual://", root.urls, root));

    it("adding a new file", () => {
      const file = new WebFSFile(dir.fullPath + "/garbage/foo.js", "//hello world\n", undefined);
      dir.insertChild(file);

      expect(dir.children.get("foo.js")).toBe(file);
      expect(file.parentFileEntry).toBe(dir);
      expect(file.fullPath).toBe(dir.fullPath + "foo.js");
      expect(root.childInserted).toHaveBeenCalledOnceWith(file);

      expect(
        () => dir.insertChild(file)
      ).toThrowError("child entry already set: " + file.localName);
    });

    it("adding a new directory", () => {
      const stubParentDir = new StubWebFsDir("wop");
      const childDir = new WebFSDirectory("virtual://garbage/wop", stubParentDir, root);

      dir.insertChild(childDir);

      expect(dir.children.get("wop")).withContext("dir has child wop").toBe(childDir);
      expect(childDir.parentFileEntry).withContext("parent entry is dir").toBe(dir);
      expect(childDir.fullPath).toBe(dir.fullPath + "wop");
      expect(root.childInserted).toHaveBeenCalledOnceWith(childDir);

      expect(
        () => dir.insertChild(childDir)
      ).toThrowError("child entry already set: " + childDir.localName);
    });

    it("removing a file", () => {
      const file = new WebFSFile(dir.fullPath + "/garbage/foo.js", "//hello world\n", undefined);

      expect(
        () => dir.removeChild(file)
      ).toThrowError("child entry not set: " + file.localName);

      dir.insertChild(file);
      root.childInserted.calls.reset();

      dir.removeChild(file);

      expect(dir.children.has(file.localName)).toBeFalse();
      expect(file.parentFileEntry).toBeUndefined();
      expect(root.childRemoved).toHaveBeenCalledOnceWith(file);

      expect(
        () => dir.removeChild(file)
      ).toThrowError("child entry not set: " + file.localName);
    });

    it("removing a directory", () => {
      const stubParentDir = new StubWebFsDir("wop");
      const childDir = new WebFSDirectory("virtual://garbage/wop", stubParentDir, root);

      expect(
        () => dir.removeChild(childDir)
      ).toThrowError("child entry not set: " + childDir.localName);

      dir.insertChild(childDir);
      root.childInserted.calls.reset();

      dir.removeChild(childDir);
      expect(dir.children.has(childDir.localName)).toBeFalse();
      expect(childDir.parentFileEntry).toBeUndefined();
      expect(root.childRemoved).toHaveBeenCalledOnceWith(childDir);

      expect(
        () => dir.removeChild(childDir)
      ).toThrowError("child entry not set: " + childDir.localName);
    });

    it("renaming a file", () => {
      const file = new WebFSFile(dir.fullPath + "/garbage/foo.js", "//hello world\n", undefined);
      dir.insertChild(file);
      root.childInserted.calls.reset();

      dir.renameChild(file, "bar.js");

      expect(dir.children.has("foo.js")).toBeFalse();
      expect(dir.children.get("bar.js")).toBe(file);
      expect(file.localName).toBe("bar.js");
      expect(root.childRenamed).toHaveBeenCalledOnceWith(file);

      expect(root.markDirty).toHaveBeenCalledOnceWith(file);
    });

    it("renaming a directory", () => {
      const stubParentDir = new StubWebFsDir("wop");
      const childDir = new WebFSDirectory("virtual://garbage/wop", stubParentDir, root);

      dir.insertChild(childDir);
      root.childInserted.calls.reset();

      dir.renameChild(childDir, "other");

      expect(dir.children.has("wop")).toBeFalse();
      expect(dir.children.get("other")).toBe(childDir);
      expect(childDir.localName).toBe("other");
      expect(root.childRenamed).toHaveBeenCalledOnceWith(childDir);

      expect(root.markDirty).toHaveBeenCalledOnceWith(childDir);
    });
  });
});
