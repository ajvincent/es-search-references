import type {
  WebFileSystemIfc
} from "../../../scripts/storage/types/WebFileSystemIfc.js";

import {
  getReferenceWebFS
} from "../helpers/ReferenceSpecFileSystem.js";

it("Reference-spec files for WebFileSystem can successfully load", async () => {
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
