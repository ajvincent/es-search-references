import {
  WebFileManager
} from "../../../scripts/storage/WebFileManager.js";

import {
  WebFileManagerIfc
} from "../../../scripts/storage/types/WebFileManager.js";

/*
import {
  AwaitedMap,
} from "../../../scripts/utilities/AwaitedMap.js";
*/

describe("WebFileManager", () => {
  it("creates an empty file system when requested", async () => {
    let referencesDir: FileSystemDirectoryHandle;
    const fileSystemKey = "test-new-filesystem";

    let SearchFilesTopDir: FileSystemDirectoryHandle;
    {
      const rootDir = await navigator.storage.getDirectory();
      SearchFilesTopDir = await rootDir.getDirectoryHandle("es-search-references", { create: false });

      const keySet: Set<string> = new Set(await Array.fromAsync(SearchFilesTopDir.keys()));
      expect(keySet.has(fileSystemKey)).toBeFalse();
    }

    expect(WebFileManager.definedFileSystems.has(fileSystemKey)).toBeFalse();

    referencesDir = await SearchFilesTopDir.getDirectoryHandle(fileSystemKey, { create: true });

    let removalNeeded = true;
    try {
      const manager: WebFileManagerIfc = await WebFileManager.buildEmpty("testing new filesystem", fileSystemKey);
      const [pkg, url] = await Promise.all([
        referencesDir.getDirectoryHandle("packages", { create: false }),
        referencesDir.getDirectoryHandle("urls", { create: false }),
      ]);
      await expectAsync(pkg.isSameEntry(manager.packagesDir)).toBeResolvedTo(true);
      await expectAsync(url.isSameEntry(manager.urlsDir)).toBeResolvedTo(true);

      await expectAsync(WebFileManager.getExisting(fileSystemKey)).toBeResolvedTo(manager);

      await manager.remove();

      const keySet: Set<string> = new Set(await Array.fromAsync(SearchFilesTopDir.keys()));
      expect(keySet.has(fileSystemKey)).toBeFalse();
      removalNeeded = keySet.has(fileSystemKey);
    }
    finally {
      if (removalNeeded) {
        await SearchFilesTopDir.removeEntry(fileSystemKey, { recursive: true });
      }
    }
  });
});
