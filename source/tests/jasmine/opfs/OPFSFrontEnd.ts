import {
  getTempDirAndCleanup,
  getResolvedTempDirPath
} from "../helpers/TempDirectories.js";

import {
  OPFSFrontEnd
} from "../../../scripts/opfs/client/FrontEnd.js";

import type {
  OPFSWebFileSystemIfc
} from "../../../scripts/opfs/types/WebFileSystemIfc.js";

import type {
  FileSystemsRecords,
  UUID
} from "../../../scripts/opfs/types/messages.js";

describe("OPFS/FrontEnd", () => {
  const dirPromise = getTempDirAndCleanup("opfs_FrontEnd");
  const pathToTempDir = getResolvedTempDirPath("opfs_FrontEnd");
  let tempDir: FileSystemDirectoryHandle;
  let frontEnd: OPFSFrontEnd;

  beforeAll(async () => {
    tempDir = await dirPromise;
    frontEnd = await OPFSFrontEnd.build(pathToTempDir);
  });

  it("generally works", async () => {
    const frontEnd: OPFSFrontEnd = await OPFSFrontEnd.build(pathToTempDir);

    await expectAsync(
      frontEnd.getAvailableSystems().then(records => Reflect.ownKeys(records).length)
    ).toBeResolvedTo(0);

    const firstKey: UUID = await frontEnd.buildEmpty("rhythm is a dancer");
    {
      const available: FileSystemsRecords = await frontEnd.getAvailableSystems();
      expect(Object.keys(available).length).toEqual(1);
      expect(available[firstKey]).toBe("rhythm is a dancer");
    }

    const secondKey: UUID = await frontEnd.buildEmpty("u can't touch this");
    {
      const available: FileSystemsRecords = await frontEnd.getAvailableSystems();
      expect(Object.keys(available).length).toEqual(2);
      expect(available[firstKey]).toBe("rhythm is a dancer");
      expect(available[secondKey]).toBe("u can't touch this");
    }

    const firstFS: OPFSWebFileSystemIfc = await frontEnd.getWebFS(firstKey);
    const secondFS: OPFSWebFileSystemIfc = await frontEnd.getWebFS(secondKey);

    await expectAsync(
      frontEnd.removeWebFS(window.crypto.randomUUID())
    ).toBeResolvedTo(false);

    await expectAsync(
      frontEnd.getWebFS(firstKey)
    ).toBeResolvedTo(firstFS);

    await expectAsync(
      frontEnd.getWebFS(secondKey)
    ).toBeResolvedTo(secondFS);

    {
      const available: FileSystemsRecords = await frontEnd.getAvailableSystems();
      expect(Object.keys(available).length).toEqual(2);
      expect(available[firstKey]).toBe("rhythm is a dancer");
      expect(available[secondKey]).toBe("u can't touch this");
    }

    await expectAsync(
      frontEnd.removeWebFS(secondKey)
    ).toBeResolvedTo(true);

    {
      const available: FileSystemsRecords = await frontEnd.getAvailableSystems();
      expect(Object.keys(available).length).toEqual(1);
      expect(available[firstKey]).toBe("rhythm is a dancer");
    }

    await frontEnd.terminate();
    await expectAsync(frontEnd.getAvailableSystems()).toBeRejected();
  });
});
