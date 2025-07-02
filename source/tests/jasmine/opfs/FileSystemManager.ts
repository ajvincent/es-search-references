import {
  getTempDirAndCleanup,
  getResolvedTempDirPath
} from "../helpers/TempDirectories.js";

import {
  OPFSFileSystemManagerClientImpl
} from "../../../scripts/opfs/client/FileSystemManager.js";

import type {
  OPFSFileSystemManagerIfc
} from "../../../scripts/opfs/types/FileSystemManagerIfc.js";

import type {
  UUID
} from "../../../scripts/opfs/types/messages.js";

describe("OPFS/FileSystemManager", () => {
  const dirPromise = getTempDirAndCleanup("opfs_FileSystemManager");
  let tempDir: FileSystemDirectoryHandle;

  let FSM: OPFSFileSystemManagerIfc;

  beforeAll(async () => {
    tempDir = await dirPromise;
  });

  it("maintains a directory index", async () => {
    FSM = await OPFSFileSystemManagerClientImpl.build(getResolvedTempDirPath("opfs_FileSystemManager"));
    expect(await FSM.getAvailableSystems()).toEqual({});

    const firstFS: UUID = await FSM.buildEmpty("first filesystem");
    expect(await FSM.getAvailableSystems()).toEqual({
      [firstFS]: "first filesystem"
    });

    const secondFS: UUID = await FSM.buildEmpty("second filesystem");
    expect(await FSM.getAvailableSystems()).toEqual({
      [firstFS]: "first filesystem",
      [secondFS]: "second filesystem"
    });

    const systemsDirPromise = tempDir.getDirectoryHandle("filesystems");

    const [firstDir, secondDir] = await Promise.all([
      systemsDirPromise.then(systemDir => systemDir.getDirectoryHandle(firstFS)),
      systemsDirPromise.then(systemDir => systemDir.getDirectoryHandle(secondFS))
    ]);
    await expectAsync(firstDir.isSameEntry(secondDir)).toBeResolvedTo(false);

    await FSM.setDescription(secondFS, "renamed filesystem");
    expect(await FSM.getAvailableSystems()).toEqual({
      [firstFS]: "first filesystem",
      [secondFS]: "renamed filesystem"
    });
    {
      const renamedDir = await systemsDirPromise.then(systemDir => systemDir.getDirectoryHandle(secondFS));
      await expectAsync(renamedDir.isSameEntry(secondDir)).toBeResolvedTo(true);
    }

    await FSM.remove(secondFS);
    expect(await FSM.getAvailableSystems()).toEqual({
      [firstFS]: "first filesystem",
    });

    {
      const systemsDir = await systemsDirPromise;
      const finalDirs = await Array.fromAsync(systemsDir.keys());
      expect(finalDirs).toEqual([firstFS]);
    }

    await FSM.terminate();
  });
});
