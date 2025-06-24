import {
  AsyncJSONMap
} from "../../../scripts/storage/AsyncJSONMap.js";

import {
  FileSystemUtilities
} from "../../../scripts/storage/FileSystemUtilities.js";

import {
  getTempDirAndCleanup
} from "../helpers/TempDirectories.js";

xdescribe("AsyncJSONMap", () => {
  const dirPromise = getTempDirAndCleanup("AsyncJSONMap");
  let tempDir: FileSystemDirectoryHandle;
  beforeAll(async () => {
    tempDir = await dirPromise;
  });

  it("initializes to an empty file cleanly", async () => {
    const emptyFile = await tempDir.getFileHandle("newMap.json", { create: true });
    const map: AsyncJSONMap<string> = await AsyncJSONMap.build(emptyFile);
    expect(map.size).toBe(0);

    map.set("foo", "alpha");

    // we have to commit before it'll be saved
    const secondMap: AsyncJSONMap<string> = await AsyncJSONMap.build(emptyFile);
    expect(secondMap.size).toBe(0);

    await map.commit();

    await secondMap.refresh();
    expect(secondMap.size).toBe(1);
    expect(secondMap.get("foo")).toBe("alpha");
  });

  it("initializes to an existing map cleanly", async () => {
    const contents = JSON.stringify({"bar": "beta"});
    await FileSystemUtilities.writeContents(tempDir, "existing.json", contents);

    const existingFile = await tempDir.getFileHandle("existing.json");
    const map: AsyncJSONMap<string> = await AsyncJSONMap.build(existingFile);
    expect(map.size).toBe(1);
    expect(map.get("bar")).toBe("beta");
  });
});
