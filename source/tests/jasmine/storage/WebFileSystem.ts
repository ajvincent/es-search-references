import type {
  UnzipCallback,
  UnzipFileFilter
} from "fflate";

import {
  unzip,
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

describe("WebFileSystem", () => {
  const dirPromise = getTempDirAndCleanup("WebFileSystem");
  let manager: FileSystemManagerIfc;
    beforeAll(async () => {
    const tempDir: FileSystemDirectoryHandle = await dirPromise;
    manager = await FileSystemManager.build(tempDir);
  });

  const threeContents = "const three = 3;\nexport { three }\n";
  const sixContents = "const six = 6;\nexport { six }\n";

  // I tested description and remove() in FileSystemManager, for avoiding collisions.

  it(".getWebFilesMap() exports the files only as a ReadonlyMap<string, string>", async () => {
    const webFS: WebFileSystemIfc = await manager.buildEmpty("getWebFiles-test");
    await expectAsync(webFS.packagesDir.isSameEntry(webFS.urlsDir)).toBeResolvedTo(false);

    const emptyMap: ReadonlyMap<string, string> = await webFS.getWebFilesMap();
    expect(emptyMap.size).toBe(0);

    // file writes wouldn't normally happen this way, but this is a simulation
    {
      const options = { create: true };
      const oneDir = await webFS.packagesDir.getDirectoryHandle("one", options);
      const twoDir = await oneDir.getDirectoryHandle("two", options);
      const threeHandle = await twoDir.getFileHandle("three.js", options);
      const threeWritable = await threeHandle.createWritable();
      await threeWritable.write(threeContents);
      await threeWritable.close();

      const fourDir = await webFS.urlsDir.getDirectoryHandle("four", options);
      const fiveDir = await fourDir.getDirectoryHandle("five", options);
      const sixHandle = await fiveDir.getFileHandle("six.js", options);
      const sixWritable = await sixHandle.createWritable();
      await sixWritable.write(sixContents);
      await sixWritable.close();
    }

    const populatedMap: ReadonlyMap<string, string> = await webFS.getWebFilesMap();
    expect(Array.from(populatedMap.entries())).toEqual([
      ["one/two/three.js", threeContents],
      ["four://five/six.js", sixContents]
    ]);

    // emptyMap is a snapshot, not a live mapping
    expect(emptyMap.size).toBe(0);
  });

  it(".importFilesMap() imports packages and urls", async () => {
    const webFS: WebFileSystemIfc = await manager.buildEmpty("importFilesMap-test");
    const map: ReadonlyMap<`packages/${string}` | `urls/${string}`, string> = new Map([
      ["packages/one/two/three.js", threeContents],
      ["urls/four/five/six.js", sixContents]
    ]);

    await webFS.importFilesMap(map);

    const populatedMap: ReadonlyMap<string, string> = await webFS.getWebFilesMap();
    expect(Array.from(populatedMap.entries())).toEqual([
      ["one/two/three.js", threeContents],
      ["four://five/six.js", sixContents]
    ]);
  });

  it(".exportAsZip() returns a properly formatted .zip file", async () => {
    const webFS: WebFileSystemIfc = await manager.buildEmpty("exportAsZip-test");
    const map: ReadonlyMap<`packages/${string}` | `urls/${string}`, string> = new Map([
      ["packages/one/two/three.js", threeContents],
      ["urls/four/five/six.js", sixContents]
    ]);
    await webFS.importFilesMap(map);

    const zipFile: File = await webFS.exportAsZip();
    let entries: [string, string][];

    {
      const deferred = Promise.withResolvers<Record<string, Uint8Array>>();
      const filter: UnzipFileFilter = file => {
        return file.size > 0;
      }
      const resultFn: UnzipCallback = (err, unzipped) => {
        if (err)
          deferred.reject(err);
        else
          deferred.resolve(unzipped);
      };

      const byteArray: Uint8Array = await zipFile.bytes();

      unzip(byteArray, { filter }, resultFn);
      const fileRecords: Record<string, Uint8Array> = await deferred.promise;

      const decoder = new TextDecoder();
      entries = Object.entries(fileRecords).map(
        ([pathToFileURL, contentsArray]) => [pathToFileURL, decoder.decode(contentsArray)]
      );
    }

    const exportedMap = new Map(entries);
    expect(exportedMap.size).toBe(2);
    expect(exportedMap.get("packages/one/two/three.js")).toBe(threeContents);
    expect(exportedMap.get("urls/four/five/six.js")).toBe(sixContents);
  });
});
