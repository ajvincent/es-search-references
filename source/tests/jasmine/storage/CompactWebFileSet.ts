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
  WebFSFile
} from "../../../scripts/storage/WebFSFile.js";

import type {
  WebFSFileIfc
} from "../../../scripts/storage/types/WebFileSystem.js";

type FileEntries = readonly (readonly [string, string])[];

describe("CompactWebFileSet", () => {
  class StorageStub implements JSONStorageIfc {
    removeItem: jasmine.Spy<(key: string) => void> = jasmine.createSpy();
    setItem: jasmine.Spy<(key: string, value: Jsonifiable) => void> = jasmine.createSpy();
  }

  const initialFiles: FileEntries = [
    ["virtual://foo/bar/foo/bar.js", "//hello world\n"],
    ["virtual://foo/bar/wop/bar.js", "//goodbye\n"],
  ];

  let storage: StorageStub;
  let fileSet: CompactWebFileSet;
  let cachedFiles: WebFSFileIfc[];

  beforeEach(() => {
    storage = new StorageStub;
    fileSet = new CompactWebFileSet(storage, "green", initialFiles);
    cachedFiles = Array.from(fileSet);
  });

  it("initializes and does not update storage", async () => {
    expect(fileSet.size).toBe(2);

    expect(cachedFiles.length).toBe(2);
    if (cachedFiles.length > 0) {
      expect(cachedFiles[0].fullPath).toBe(initialFiles[0][0]);
      expect(cachedFiles[0].contents).toBe(initialFiles[0][1]);
      expect(cachedFiles[0].parentFileEntry).toBeUndefined();
    }

    if (cachedFiles.length > 1) {
      expect(cachedFiles[1].fullPath).toBe(initialFiles[1][0]);
      expect(cachedFiles[1].contents).toBe(initialFiles[1][1]);
      expect(cachedFiles[1].parentFileEntry).toBeUndefined();
    }

    expect(await fileSet.contentEntries()).toEqual(initialFiles);
    expect(fileSet.delayPromise).toBeUndefined();
    expect(storage.removeItem).toHaveBeenCalledTimes(0);
    expect(storage.setItem).toHaveBeenCalledTimes(0);
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

      expect(storage.setItem).toHaveBeenCalledTimes(0);

      currentPromise ??= Promise.resolve();
      await currentPromise;

      expect(storage.setItem).toHaveBeenCalledTimes(1);
      expect(storage.setItem.calls.argsFor(0) as [string, FileEntries]).toEqual([
        "green",
        [
          ["virtual://foo/bar/foo/other.js", "//hello world\n"],
          ["virtual://foo/bar/wop/other.js", "//goodbye\n"],
        ]
      ]);

      expect(storage.removeItem).toHaveBeenCalledTimes(0);
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

      expect(storage.setItem).toHaveBeenCalledTimes(0);

      currentPromise ??= Promise.resolve();
      await currentPromise;

      expect(storage.setItem).toHaveBeenCalledTimes(1);
      expect(storage.setItem.calls.argsFor(0) as [string, FileEntries]).toEqual([
        "green",
        [
          ["virtual://foo/bar/foo/bar.js", "//empty\n"],
          ["virtual://foo/bar/wop/bar.js", "//nothing\n"],
        ]
      ]);

      expect(storage.removeItem).toHaveBeenCalledTimes(0);
    });

    it("file deletion", async () => {
      expect(fileSet.delete(cachedFiles[0])).toBeTrue();

      let currentPromise = fileSet.delayPromise;
      expect(currentPromise).toBeDefined();
      expect(storage.setItem).toHaveBeenCalledTimes(0);

      currentPromise ??= Promise.resolve();
      await currentPromise;

      expect(storage.setItem).toHaveBeenCalledTimes(1);
      expect(storage.setItem.calls.argsFor(0) as [string, FileEntries]).toEqual([
        "green",
        [
          ["virtual://foo/bar/wop/bar.js", "//goodbye\n"],
        ]
      ]);

      expect(storage.removeItem).toHaveBeenCalledTimes(0);
    });

    it("file creation", async () => {
      const webFile = new WebFSFile("virtual://root.js", "//root\n", undefined);
      expect(fileSet.add(webFile)).toBe(fileSet);

      let currentPromise = fileSet.delayPromise;
      expect(currentPromise).toBeDefined();
      expect(storage.setItem).toHaveBeenCalledTimes(0);

      currentPromise ??= Promise.resolve();
      await currentPromise;

      expect(storage.setItem).toHaveBeenCalledTimes(1);
      expect(storage.setItem.calls.argsFor(0) as [string, FileEntries]).toEqual([
        "green",
        [
          ["virtual://foo/bar/foo/bar.js", "//hello world\n"],
          ["virtual://foo/bar/wop/bar.js", "//goodbye\n"],
          ["virtual://root.js", "//root\n"],
        ]
      ]);

      expect(storage.removeItem).toHaveBeenCalledTimes(0);
    });

    it("clearing the fileSet", async () => {
      fileSet.clear();

      let currentPromise = fileSet.delayPromise;
      expect(currentPromise).toBeDefined();
      expect(storage.removeItem).toHaveBeenCalledTimes(0);

      currentPromise ??= Promise.resolve();
      await currentPromise;

      expect(storage.removeItem).toHaveBeenCalledTimes(1);
      expect(storage.removeItem.calls.argsFor(0)).toEqual([
        "green"
      ]);

      expect(storage.setItem).toHaveBeenCalledTimes(0);
    });
  });
});
