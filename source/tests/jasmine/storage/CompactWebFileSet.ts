import type {
  Jsonifiable
} from "type-fest";

import {
  CompactWebFileSet
} from "../../../scripts/storage/CompactWebFileSet.js";

import type {
  JSONStorageIfc
} from "../../../scripts/storage/types/JSONStorageIfc.js";

import {
  WebFileFS
} from "../../../scripts/storage/WebFSFile.js";

describe("CompactWebFileSet", () => {
  class StorageStub implements JSONStorageIfc {
    spy = jasmine.createSpy();
    removeItem(key: string): void {
      this.spy("removeItem", key);
    }
    setItem(key: string, value: Jsonifiable): void {
      this.spy("setItem", key, value);
    }
  }

  const initialFiles: readonly (readonly [string, string])[] = [
    ["virtual://foo/bar/foo/bar.js", "//hello world\n"],
    ["virtual://foo/bar/wop/bar.js", "//goodbye\n"],
  ];

  let storage: StorageStub;
  let fileSet: CompactWebFileSet;
  let cachedFiles: WebFileFS[];

  beforeEach(() => {
    storage = new StorageStub;
    fileSet = new CompactWebFileSet(storage, "green", initialFiles);
    cachedFiles = Array.from(fileSet);
  });

  it("initializes and does not update storage", () => {
    expect(fileSet.size).toBe(2);

    expect(cachedFiles.length).toBe(2);
    if (cachedFiles.length > 0) {
      expect(cachedFiles[0].fullPath).toBe(initialFiles[0][0]);
      expect(cachedFiles[0].contents).toBe(initialFiles[0][1]);
      expect(cachedFiles[0].parentFile).toBeUndefined();
    }

    if (cachedFiles.length > 1) {
      expect(cachedFiles[1].fullPath).toBe(initialFiles[1][0]);
      expect(cachedFiles[1].contents).toBe(initialFiles[1][1]);
      expect(cachedFiles[1].parentFile).toBeUndefined();
    }

    expect(fileSet.contentEntries).toEqual(initialFiles);
    expect(fileSet.delayPromise).toBeUndefined();
    expect(storage.spy).toHaveBeenCalledTimes(0);
  });

  describe("updates the storage for a", () => {
    it("fullPath change when the file is re-added", async () => {
      cachedFiles[0].localName = "other.js";
      expect(fileSet.delayPromise).toBeUndefined();

      fileSet.add(cachedFiles[0]);
      expect(fileSet.delayPromise).toBeDefined();

      let currentPromise = fileSet.delayPromise;
      cachedFiles[1].localName = "other.js";
      fileSet.add(cachedFiles[1]);
      expect(fileSet.delayPromise).toBe(currentPromise);

      expect(storage.spy).toHaveBeenCalledTimes(0);

      currentPromise ??= Promise.resolve();
      await currentPromise;

      expect(storage.spy).toHaveBeenCalledTimes(1);
      expect(storage.spy.calls.argsFor(0)).toEqual([
        "setItem",
        "green",
        [
          ["virtual://foo/bar/foo/other.js", "//hello world\n"],
          ["virtual://foo/bar/wop/other.js", "//goodbye\n"],
        ]
      ]);
    });

    it("contents change when when the file is re-added", async () => {
      cachedFiles[0].contents = "//empty\n";
      expect(fileSet.delayPromise).toBeUndefined();

      fileSet.add(cachedFiles[0]);
      expect(fileSet.delayPromise).toBeDefined();

      let currentPromise = fileSet.delayPromise;
      cachedFiles[1].contents = "//nothing\n";
      fileSet.add(cachedFiles[1]);
      expect(fileSet.delayPromise).toBe(currentPromise);

      expect(storage.spy).toHaveBeenCalledTimes(0);

      currentPromise ??= Promise.resolve();
      await currentPromise;

      expect(storage.spy).toHaveBeenCalledTimes(1);
      expect(storage.spy.calls.argsFor(0)).toEqual([
        "setItem",
        "green",
        [
          ["virtual://foo/bar/foo/bar.js", "//empty\n"],
          ["virtual://foo/bar/wop/bar.js", "//nothing\n"],
        ]
      ]);
    });

    it("file deletion", async () => {
      expect(fileSet.delete(cachedFiles[0])).toBeTrue();

      let currentPromise = fileSet.delayPromise;
      expect(currentPromise).toBeDefined();
      expect(storage.spy).toHaveBeenCalledTimes(0);

      currentPromise ??= Promise.resolve();
      await currentPromise;

      expect(storage.spy).toHaveBeenCalledTimes(1);
      expect(storage.spy.calls.argsFor(0)).toEqual([
        "setItem",
        "green",
        [
          ["virtual://foo/bar/wop/bar.js", "//goodbye\n"],
        ]
      ]);
    });

    it("file creation", async () => {
      const webFile = new WebFileFS("virtual://root.js", "//root\n", undefined);
      expect(fileSet.add(webFile)).toBe(fileSet);

      let currentPromise = fileSet.delayPromise;
      expect(currentPromise).toBeDefined();
      expect(storage.spy).toHaveBeenCalledTimes(0);

      currentPromise ??= Promise.resolve();
      await currentPromise;

      expect(storage.spy).toHaveBeenCalledTimes(1);
      expect(storage.spy.calls.argsFor(0)).toEqual([
        "setItem",
        "green",
        [
          ["virtual://foo/bar/foo/bar.js", "//hello world\n"],
          ["virtual://foo/bar/wop/bar.js", "//goodbye\n"],
          ["virtual://root.js", "//root\n"],
        ]
      ]);
    });

    it("clearing the fileSet", async () => {
      fileSet.clear();

      let currentPromise = fileSet.delayPromise;
      expect(currentPromise).toBeDefined();
      expect(storage.spy).toHaveBeenCalledTimes(0);

      currentPromise ??= Promise.resolve();
      await currentPromise;

      expect(storage.spy).toHaveBeenCalledTimes(1);
      expect(storage.spy.calls.argsFor(0)).toEqual([
        "removeItem",
        "green"
      ]);
    });
  });
});
