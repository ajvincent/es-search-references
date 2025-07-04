import {
  getTempDirAndCleanup,
  getResolvedTempDirPath
} from "../helpers/TempDirectories.js";

import {
  OPFSWebFileSystemClientImpl
} from "../../../scripts/opfs/client/WebFileSystem.js";

import type {
  OPFSWebFileSystemIfc,
  TopDirectoryRecord
} from "../../../scripts/opfs/types/WebFileSystemIfc.js";

describe("OPFS/WebFileSystem", () => {
  const dirPromise = getTempDirAndCleanup("opfs_WebFileSystem");
  let tempDir: FileSystemDirectoryHandle;

  let WFS: OPFSWebFileSystemIfc;

  beforeAll(async () => {
    tempDir = await dirPromise;
  });

  const mockDirectories: TopDirectoryRecord = {
    packages: {
      "es-search-references": {
        "red": "const RED = { value: 'red' };\n export { RED };\n"
      }
    },
    urls: {
      one: {
        two: {
          "three.js": "const THREE = { value: 3 };\nexport { THREE };\n",
          "four.js": "const FOUR = { value: 4 };\nexport { FOUR };\n",
        },
        five: {
          "six.js": "const SIX = { value: 6 };\nexport { SIX };\n",
        },
      },
      seven: {
        "eight.js": "const EIGHT = { value: 8 };\nexport { EIGHT };\n",
      }
    }
  };

  it("can preserve and echo an index", async () => {
    WFS = await OPFSWebFileSystemClientImpl.build(getResolvedTempDirPath("opfs_WebFileSystem/echo"));

    await WFS.importDirectoryRecord(mockDirectories);
    await WFS.terminate();

    WFS = await OPFSWebFileSystemClientImpl.build(getResolvedTempDirPath("opfs_WebFileSystem/echo"));

    const persisted = await WFS.exportDirectoryRecord();
    expect(persisted).toEqual(mockDirectories);

    const webFiles = await WFS.getWebFilesRecord();
    expect(webFiles).toEqual({
      "es-search-references/red": "const RED = { value: 'red' };\n export { RED };\n",
      "one://two/three.js": "const THREE = { value: 3 };\nexport { THREE };\n",
      "one://two/four.js": "const FOUR = { value: 4 };\nexport { FOUR };\n",
      "one://five/six.js": "const SIX = { value: 6 };\nexport { SIX };\n",
      "seven://eight.js": "const EIGHT = { value: 8 };\nexport { EIGHT };\n",
    });

    const index = await WFS.getIndex();
    expect(index).toEqual({
      "es-search-references": {
        "red": ""
      },
      "one://": {
        two: {
          "three.js": "",
          "four.js": "",
        },
        five: {
          "six.js": "",
        },
      },
      "seven://": {
        "eight.js": "",
      }
    });

    await WFS.terminate();
  });
});
