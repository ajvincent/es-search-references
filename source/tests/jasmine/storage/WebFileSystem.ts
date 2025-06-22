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
  let webFS: WebFileSystemIfc;
  beforeAll(async () => {
    const tempDir: FileSystemDirectoryHandle = await dirPromise;
    const manager: FileSystemManagerIfc = await FileSystemManager.build(tempDir);

    webFS = await manager.buildEmpty("WebFileSystem test");
  });

  // I tested description and remove() in FileSystemManager, for avoiding collisions.

  it("creates a map of packages and urls to file sources on demand", async () => {
    await expectAsync(webFS.packagesDir.isSameEntry(webFS.urlsDir)).toBeResolvedTo(false);

    const emptyMap: ReadonlyMap<string, string> = await webFS.getWebFilesMap();
    expect(emptyMap.size).toBe(0);

    // file writes wouldn't normally happen this way, but this is a simulation
    const threeContents = "const three = 3;\nexport { three }\n";
    const sixContents = "const six = 6;\nexport { six }\n";
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
});
