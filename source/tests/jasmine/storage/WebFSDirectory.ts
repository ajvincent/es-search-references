import {
  WebFSDirectory
} from "../../../scripts/storage/WebFSDirectory.js";

import {
  WebFSFile
} from "../../../scripts/storage/WebFSFile.js";

import {
  WebFSFileType
} from "../../../scripts/storage/constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSFileIfc
} from "../../../scripts/storage/types/WebFileSystem.js";

describe("WebFSDirectory", () => {
  let topDir: WebFSDirectoryIfc;
  beforeEach(() => topDir = new WebFSDirectory);

  it(".addFileDeep() creates files and directories", () => {
    topDir.addFileDeep(["foo", "bar.js"], 0, "//hello world\n");
    expect(topDir.children.size).toBe(1);

    const foo = topDir.children.get("foo");
    expect(foo).toBeInstanceOf(WebFSDirectory);
    if (foo instanceof WebFSDirectory === false) {
      return;
    }

    const bar = foo.children.get("bar.js");
    expect(bar).toBeInstanceOf(WebFSFile);
    if (bar instanceof WebFSFile === false) {
      return;
    }

    expect(bar.contents).toBe("//hello world\n");
  });

  it(".addDirectoryDeep() creates directories", () => {
    topDir.addDirectoryDeep(["foo", "bar"], 0);
    expect(topDir.children.size).toBe(1);

    const foo = topDir.children.get("foo");
    expect(foo).toBeInstanceOf(WebFSDirectory);
    if (foo instanceof WebFSDirectory === false) {
      return;
    }

    const bar = foo.children.get("bar");
    expect(bar).toBeInstanceOf(WebFSDirectory);
    if (bar instanceof WebFSDirectory === false) {
      return;
    }

    expect(bar.children.size).toBe(0);
  });

  it(".removeFileDeep() can remove files", () => {
    topDir.addFileDeep(["foo", "bar.js"], 0, "//hello world\n");
    topDir.addFileDeep(["foo", "wop.js"], 0, "//greetings\n");
    topDir.addDirectoryDeep(["foo", "baz"], 0);
    topDir.removeFileDeep(["foo", "bar.js"], 0);
    expect(topDir.children.size).toBe(1);

    const foo = topDir.children.get("foo");
    expect(foo).toBeInstanceOf(WebFSDirectory);
    if (foo instanceof WebFSDirectory === false) {
      return;
    }

    expect(foo.children.size).toBe(2);
    expect(foo.children.has("bar.js")).toBe(false);
    expect(foo.children.get("wop.js")).toBeInstanceOf(WebFSFile);
    expect(foo.children.get("baz")).toBeInstanceOf(WebFSDirectory);

    topDir.removeFileDeep(["foo"], 0);
    expect(topDir.children.size).toBe(0);
  });

  it(".getFileDeep() can get a directory or a file", () => {
    topDir.addFileDeep(["foo", "bar.js"], 0, "//hello world\n");
    topDir.addFileDeep(["foo", "wop.js"], 0, "//greetings\n");
    topDir.addDirectoryDeep(["wop", "baz"], 0);

    const bar = topDir.getFileDeep(["foo", "bar.js"], 0);
    expect(bar.fileType).toBe(WebFSFileType.FILE);
    if (bar.fileType !== WebFSFileType.FILE)
      return;
    expect(bar.contents).toBe("//hello world\n");

    const baz = topDir.getFileDeep(["wop", "baz"], 0);
    expect(baz.fileType).toBe(WebFSFileType.DIR);
  });

  it(".getWebFileContentsDeep() returns [string, WebFSFile] for all files inside", () => {
    topDir.addFileDeep(["foo", "bar.js"], 0, "//hello world\n");
    topDir.addDirectoryDeep(["foo", "baz"], 0);
    topDir.addFileDeep(["bar", "wop.js"], 0, "//greetings\n");

    const entries: [string, string][] = Array.from(topDir.getWebFileContentsDeep("topDir"));
    expect(entries).toEqual([
      ["topDir/bar/wop.js", "//greetings\n"],
      ["topDir/foo/bar.js", "//hello world\n"]
    ])
  });
});
