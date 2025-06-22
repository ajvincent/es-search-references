import {
  FileSystemManager
} from "../../../scripts/storage/FileSystemManager.js";

import type {
  FileSystemManagerIfc
} from "../../../scripts/storage/types/FileSystemManagerIfc.js";

import type {
  WebFileSystemIfc
} from "../../../scripts/storage/types/WebFileSystemIfc.js";

import {
  getTempDirAndCleanup
} from "../helpers/TempDirectories.js";

describe("FileSystemManager", () => {
  const dirPromise = getTempDirAndCleanup("FileSystemManager");
  let tempDir: FileSystemDirectoryHandle;
  beforeAll(async () => {
    tempDir = await dirPromise;
  });

  it("creates and caches WebFileManagerIfc instances", async () => {
    const firstMgr: FileSystemManagerIfc = await FileSystemManager.build(tempDir);
    expect(firstMgr.availableSystems.size).toBe(0);

    const webFS: WebFileSystemIfc = await firstMgr.buildEmpty("test system");
    expect(webFS.description).toBe("test system");

    const entries: [string, string][] = Array.from(firstMgr.availableSystems.entries());
    expect(entries.length).toBe(1);
    expect(entries[0][1]).toBe(webFS.description);

    // we don't get to define the key
    const key = entries[0][0];

    await expectAsync(firstMgr.getExisting(key)).toBeResolvedTo(webFS);

    await webFS.setDescription("new fs");
    expect(webFS.description).toBe("new fs");
    entries[0][1] = "new fs";
    expect(Array.from(firstMgr.availableSystems.entries())).toEqual(entries);

    {
      // testing existing file systems on restore
      const secondMgr: FileSystemManagerIfc = await FileSystemManager.build(tempDir);
      expect(secondMgr).not.toBe(firstMgr);
      expect(Array.from(secondMgr.availableSystems.entries())).toEqual(entries);

      const secondFS: WebFileSystemIfc = await secondMgr.getExisting(key);
      expect(secondFS).not.toBe(webFS);
      await expectAsync(
        secondFS.packagesDir.isSameEntry(webFS.packagesDir)
      ).toBeResolvedTo(true);
      await expectAsync(
        secondFS.urlsDir.isSameEntry(webFS.urlsDir)
      ).toBeResolvedTo(true);
      expect(secondFS.description).toBe(webFS.description);
    }

    await expectAsync(
      firstMgr.buildEmpty("new fs")
    ).toBeRejectedWithError("duplicate description: new fs");

    {
      // this should be allowed, we renamed the description
      const secondFS: WebFileSystemIfc = await firstMgr.buildEmpty("test system");
      expect(secondFS.description).toBe("test system");
      const newEntries: [string, string][] = Array.from(firstMgr.availableSystems.entries());
      expect(newEntries.length).toBe(2);
      expect(newEntries[0]).toEqual(entries[0]);
      expect(newEntries[1][1]).toBe("test system");
      const secondKey = newEntries[1][0];

      await expectAsync(
        secondFS.packagesDir.isSameEntry(webFS.packagesDir)
      ).toBeResolvedTo(false);
      await expectAsync(
        secondFS.urlsDir.isSameEntry(webFS.urlsDir)
      ).toBeResolvedTo(false);

      await secondFS.remove();
      expect(Array.from(firstMgr.availableSystems.entries())).toEqual(entries);
      await expectAsync(
        firstMgr.getExisting(secondKey)
      ).toBeRejectedWithError("unknown key: " + secondKey);
    }
  });
});
