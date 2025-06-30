import {
  installReferenceSpecs
} from "../../../scripts/reference-spec/WebFileSystem.js";

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
  getReferenceWebFS
} from "../helpers/ReferenceSpecFileSystem.js";

import {
  getTempDirAndCleanup
} from "../helpers/TempDirectories.js";

xdescribe("Reference-spec files for WebFileSystem can successfully load from", () => {
  const dirPromise = getTempDirAndCleanup("webfilesystem-reference-specs");
  let tempWebFS: WebFileSystemIfc;
  beforeAll(async () => {
    const tempDir: FileSystemDirectoryHandle = await dirPromise;
    const manager: FileSystemManagerIfc = await FileSystemManager.build(tempDir);

    tempWebFS = await manager.buildEmpty("WebFileSystem test");
  });

  it("a new WebFileSystem", async () => {
    await installReferenceSpecs(tempWebFS);

    const map: ReadonlyMap<string, string> = await tempWebFS.getWebFilesMap();
    expect(map.has(
      "virtual://home/fixtures/OneToOneStrongMap/OneToOneStrongMap.js"
    )).toBeTrue();

    expect(map.has(
      "virtual://home/fixtures/OneToOneStrongMap/WeakStrongMap.js"
    )).toBeTrue();

    expect(map.has(
      "virtual://home/reference-spec/OneToOneStrongMap.js"
    )).toBeTrue();
  });

  it("the official location", async () => {
    const webFS: WebFileSystemIfc = await getReferenceWebFS();

    const map: ReadonlyMap<string, string> = await webFS.getWebFilesMap();
    expect(map.has(
      "virtual://home/fixtures/OneToOneStrongMap/OneToOneStrongMap.js"
    )).toBeTrue();

    expect(map.has(
      "virtual://home/fixtures/OneToOneStrongMap/WeakStrongMap.js"
    )).toBeTrue();

    expect(map.has(
      "virtual://home/reference-spec/OneToOneStrongMap.js"
    )).toBeTrue();
  });
});

