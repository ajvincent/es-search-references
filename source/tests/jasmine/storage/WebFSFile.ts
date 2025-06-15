import {
  WebFSFileType
} from "../../../scripts/storage/constants.js";

import type {
  WebFSNodeIfc,
  WebFSDirectoryIfc,
  WebFSPackageIfc,
  WebFSRootIfc,
  WebFSURLIfc,
  WebFSFileIfc,
} from "../../../scripts/storage/types/WebFileSystem.js";

import {
  WebFileFS
} from "../../../scripts/storage/WebFSFile.js";

import {
  OrderedStringMap
} from "../../../scripts/utilities/OrderedStringMap.js";

describe("WebFileFS", () => {
  const fullPath = "virtual://foo/bar/foo/bar.js";
  const contents = "//hello world\n";
  const leaf = "bar.js";

  let webFile: WebFileFS;

  class StubWebFS implements WebFSRootIfc {
    isReadonly = false;
    packages = new OrderedStringMap<WebFSPackageIfc>;
    urls = new OrderedStringMap<WebFSURLIfc>;

    spy = jasmine.createSpy();

    markDirty(fileStructureChanged: boolean, fileNode: WebFSNodeIfc): void {
      this.spy(fileStructureChanged, fileNode);
    }
  }

  class StubWebDir implements WebFSDirectoryIfc {
    parentFile = undefined;
    localName: string;
    fullPath: string;
    readonly fileType = WebFSFileType.DIR;
    children = new OrderedStringMap<WebFSDirectoryIfc | WebFSFileIfc>;

    constructor(localName: string) {
      this.localName = localName;
      this.fullPath = "virtual://foo/bar/" + localName;
    }
  }

  describe("without an initial parent file", () => {
    beforeEach(() => webFile = new WebFileFS(fullPath, contents, undefined));

    it("instances reflect the constructor, without a parentFile", () => {
      expect(webFile.localName).toBe(leaf);
      expect(webFile.fullPath).toBe(fullPath);
      expect(webFile.contents).toBe(contents);
      expect(webFile.parentFile).toBeUndefined();
    });

    it("can set the root, once", () => {
      const fs1 = new StubWebFS, fs2 = new StubWebFS;
      webFile.root = fs1;
      expect(
        () => webFile.root = fs2
      ).toThrowError("we already have a root, what are you doing?");

      expect(
        () => webFile.root = fs1
      ).toThrowError("we already have a root, what are you doing?");

      // getter is not defined
      expect(webFile.root).toBeUndefined();

      expect(fs1.spy).toHaveBeenCalledTimes(0);
    });

    it("can set the localname", () => {
      webFile.localName = "foo.js";
      expect(webFile.localName).toBe("foo.js");
      expect(webFile.fullPath).toBe("virtual://foo/bar/foo/foo.js");
    });

    it("can set the parent file multiple times", () => {
      const dir1 = new StubWebDir("bar");
      const dir2 = new StubWebDir("wop");

      webFile.parentFile = dir1;
      expect(webFile.localName).toBe("bar.js");
      expect(webFile.fullPath).toBe("virtual://foo/bar/bar/bar.js");
      expect(webFile.parentFile).toBe(dir1);

      webFile.parentFile = dir2;
      expect(webFile.localName).toBe("bar.js");
      expect(webFile.fullPath).toBe("virtual://foo/bar/wop/bar.js");
      expect(webFile.parentFile).toBe(dir2);
    });

    it("notifies the root when the local name changes", () => {
      const fs1 = new StubWebFS;
      webFile.root = fs1;

      webFile.localName = "wop.js";
      expect(fs1.spy).toHaveBeenCalledOnceWith(false, webFile);
    });

    it("notifies the root when the contents change", () => {
      const fs1 = new StubWebFS;
      webFile.root = fs1;

      webFile.contents = "//goodbye\n";
      expect(fs1.spy).toHaveBeenCalledOnceWith(false, webFile);
      expect(webFile.contents).toBe("//goodbye\n");
    });

    it("does not notify the root when the parent file changes", () => {
      const fs1 = new StubWebFS;
      webFile.root = fs1;

      const dir1 = new StubWebDir("bar");
      webFile.parentFile = dir1;
      expect(fs1.spy).toHaveBeenCalledTimes(0);
    });
  });
});
