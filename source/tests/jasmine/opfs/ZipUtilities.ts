import {
  ZipUtilities
} from "../../../scripts/opfs/client/ZipUtilities.js";

import {
  ReferenceSpecRecord
} from "../../../scripts/reference-spec/WebFileSystem.js";

it("ZipUtilities can compress and decompress a WebFileSystem", async () => {
  const zipFile = await ZipUtilities.buildZipFile(ReferenceSpecRecord);
  const extracted = await ZipUtilities.extractFromZip(zipFile);

  expect(extracted).toEqual(ReferenceSpecRecord);
  expect(extracted).not.toBe(ReferenceSpecRecord);
});
