import {
  getTempDirAndCleanup,
  getResolvedTempDirPath
} from "../helpers/TempDirectories.js";

import {
  OPFSWebFileSystemClientImpl
} from "../../../scripts/opfs/client/WebFileSystem.js";

import type {
  OPFSWebFileSystemIfc,
} from "../../../scripts/opfs/types/WebFileSystemIfc.js";

describe("OPFS/WebFileSystem", () => {
  const dirPromise = getTempDirAndCleanup("opfs_WebFileSystem");
  let tempDir: FileSystemDirectoryHandle;

  let WFS: OPFSWebFileSystemIfc;

  beforeAll(async () => {
    tempDir = await dirPromise;
  });

  const mockDirectories = {
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
      "es-search-references/red": mockDirectories.packages["es-search-references"].red,
      "one://two/three.js": mockDirectories.urls.one.two["three.js"],
      "one://two/four.js": mockDirectories.urls.one.two["four.js"],
      "one://five/six.js": mockDirectories.urls.one.five["six.js"],
      "seven://eight.js": mockDirectories.urls.seven["eight.js"],
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

  it("can manipulate files", async () => {
    WFS = await OPFSWebFileSystemClientImpl.build(getResolvedTempDirPath("opfs_WebFileSystem/file_io"));
    await WFS.importDirectoryRecord(mockDirectories);

    await expectAsync(
      WFS.readFileDeep("es-search-references/red")
    ).withContext("es-search-references/red").toBeResolvedTo(mockDirectories.packages["es-search-references"].red);

    await expectAsync(
      WFS.readFileDeep("one://two/three.js")
    ).withContext("one://two/three.js").toBeResolvedTo(mockDirectories.urls.one.two["three.js"]);

    await WFS.writeFileDeep("seven://nine.js", "const EIGHT = { value: 8 };\nexport { EIGHT };\n");
    await expectAsync(
      WFS.readFileDeep("seven://nine.js")
    ).withContext("write seven://nine.js").toBeResolvedTo("const EIGHT = { value: 8 };\nexport { EIGHT };\n");

    await expectAsync(
      WFS.removeEntry("one://five")
    ).withContext("remove one://five").toBeResolved();

    let index = await WFS.getIndex();
    expect(index).withContext("remove one://five index").toEqual({
      "es-search-references": {
        "red": ""
      },
      "one://": {
        two: {
          "three.js": "",
          "four.js": "",
        },
      },
      "seven://": {
        "eight.js": "",
        "nine.js": "",
      }
    });

    await expectAsync(
      WFS.removeEntry("seven://nine.js")
    ).withContext("remove seven://nine.js").toBeResolved();

    index = await WFS.getIndex();
    expect(index).withContext("remove seven://nine.js index").toEqual({
      "es-search-references": {
        "red": ""
      },
      "one://": {
        two: {
          "three.js": "",
          "four.js": "",
        },
      },
      "seven://": {
        "eight.js": "",
      }
    });

    await expectAsync(
      WFS.createDirDeep("seven://ten")
    ).withContext("create seven://ten").toBeResolved();
    index = await WFS.getIndex();
    expect(index).withContext("create seven://ten index").toEqual({
      "es-search-references": {
        "red": ""
      },
      "one://": {
        two: {
          "three.js": "",
          "four.js": "",
        },
      },
      "seven://": {
        "eight.js": "",
        "ten": {

        }
      }
    });

    await expectAsync(
      WFS.removeEntry("seven://")
    ).withContext("remove seven://").toBeResolved();

    index = await WFS.getIndex();
    expect(index).withContext("remove seven:// index").toEqual({
      "es-search-references": {
        "red": ""
      },
      "one://": {
        two: {
          "three.js": "",
          "four.js": "",
        },
      },
    });

    await WFS.terminate();
  });

  it("can create a new file system from scratch", async () => {
    WFS = await OPFSWebFileSystemClientImpl.build(getResolvedTempDirPath("opfs_WebFileSystem/fromScratch"));
    await Promise.all([
      WFS.writeFileDeep("es-search-references/red", mockDirectories.packages["es-search-references"].red),
      WFS.writeFileDeep("one://two/three.js", mockDirectories.urls.one.two["three.js"]),
      WFS.writeFileDeep("one://two/four.js", mockDirectories.urls.one.two["four.js"]),
      WFS.writeFileDeep("one://five/six.js", mockDirectories.urls.one.five["six.js"]),
      WFS.writeFileDeep("seven://eight.js", mockDirectories.urls.seven["eight.js"]),
    ]);

    const persisted = await WFS.exportDirectoryRecord();
    expect(persisted).toEqual(mockDirectories);

    await WFS.terminate();
  });
});
