import type {
  FlateCallback,
} from "fflate";

import {
  zip
} from "../../../lib/packages/fflate.js";

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
    const tempChildDir = await tempDir.getDirectoryHandle("create-and-cache", { create: true });
    const firstMgr: FileSystemManagerIfc = await FileSystemManager.build(tempChildDir);
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
      const secondMgr: FileSystemManagerIfc = await FileSystemManager.build(tempChildDir);
      expect(secondMgr).not.toBe(firstMgr);
      expect(Array.from(secondMgr.availableSystems.entries())).toEqual(entries);

      const secondFS: WebFileSystemIfc = await secondMgr.getExisting(key);
      expect(secondFS).not.toBe(webFS);
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

      await secondFS.remove();
      expect(Array.from(firstMgr.availableSystems.entries())).toEqual(entries);
      await expectAsync(
        firstMgr.getExisting(secondKey)
      ).toBeRejectedWithError("unknown key: " + secondKey);
    }
  });

  it(".importFromZip() creates a new file system from a zip file", async () => {
    const threeContents = "const three = 3;\nexport { three }\n";
    const sixContents = "const six = 6;\nexport { six }\n";

    let zipFile: File;
    {
      const encoder = new TextEncoder();

      const rawFiles: [string, Uint8Array][] = [
        ["packages/one/two/three.js", encoder.encode(threeContents)],
        ["urls/four/five/six.js", encoder.encode(sixContents)]
      ];

      const deferred = Promise.withResolvers<Uint8Array<ArrayBufferLike>>();
      const resultFn: FlateCallback = (err, zipped) => {
        if (err)
          deferred.reject(err);
        else
          deferred.resolve(zipped);
      }

      zip(Object.fromEntries(rawFiles), resultFn);
      const zipUint8: Uint8Array<ArrayBufferLike> = await deferred.promise;
      zipFile = new File([zipUint8], "imported-files.zip", { type: "application/zip"});
    }

    const tempChildDir = await tempDir.getDirectoryHandle("import-from-zip", { create: true });
    const systemMgr: FileSystemManagerIfc = await FileSystemManager.build(tempChildDir);

    // all of this to set up:
    const webFS: WebFileSystemIfc = await systemMgr.importFromZip("import from zip", zipFile);

    const filesMap = await webFS.getWebFilesMap();
    expect(Array.from(filesMap.entries())).toEqual([
      ["one/two/three.js", threeContents],
      ["four://five/six.js", sixContents]
    ]);
  });
});
