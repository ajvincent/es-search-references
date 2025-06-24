import {
  FileSystemUtilities
} from "../../../scripts/storage/FileSystemUtilities.js";

import {
  getTempDirAndCleanup
} from "../helpers/TempDirectories.js";

xdescribe("FileSystemUtilities", () => {
  const dirPromise = getTempDirAndCleanup("FileSystemUtilities");
  let tempDir: FileSystemDirectoryHandle;
  let fixturesDir: FileSystemDirectoryHandle;

  const circleRadius = "4", circleCoords = "(5, 3)", rectangleJSON = "{ x: 20, y: 20, width: 40, height: 30 }";
  const monday = "How does it feel?", tuesday = "I'm just beginning to see...";

  const createOptions = { create: true };

  beforeAll(async () => {
    tempDir = await dirPromise;

    fixturesDir = await tempDir.getDirectoryHandle("fixtures", createOptions);
    const redDir = await fixturesDir.getDirectoryHandle("red", createOptions);
    const circleDir = await redDir.getDirectoryHandle("circle", createOptions);
    {
      const radius = await circleDir.getFileHandle("radius", createOptions);
      const writable = await radius.createWritable();
      await writable.write(circleRadius);
      await writable.close();
    }
    {
      const coords = await circleDir.getFileHandle("coordinates", createOptions);
      const writable = await coords.createWritable();
      await writable.write(circleCoords);
      await writable.close();
    }

    const rectangle = await redDir.getFileHandle("rectangle.json", createOptions);
    {
      const writable = await rectangle.createWritable();
      await writable.write(rectangleJSON);
      await writable.close();
    }

    const blueDir = await fixturesDir.getDirectoryHandle("blue", createOptions);
    {
      const newOrder = await blueDir.getFileHandle("monday", createOptions);
      const writable = await newOrder.createWritable();
      await writable.write(monday);
      await writable.close();
    }
  });

  it(".readContents() can get the text of a file", async () => {
    const blueDir = await fixturesDir.getDirectoryHandle("blue");
    await expectAsync(FileSystemUtilities.readContents(blueDir, "monday")).toBeResolvedTo(monday);
  });

  it(".writeContents() can write a file", async () => {
    await FileSystemUtilities.writeContents(tempDir, "tuesday", tuesday);
    await expectAsync(FileSystemUtilities.readContents(tempDir, "tuesday")).toBeResolvedTo(tuesday);
  });

  it(".copyFile() can copy a file", async () => {
    const blueDir = await fixturesDir.getDirectoryHandle("blue");
    const copyDir = await tempDir.getDirectoryHandle("copyFileTarget", createOptions);
    await FileSystemUtilities.copyFile(blueDir, "monday", copyDir);
    await expectAsync(FileSystemUtilities.readContents(copyDir, "monday")).toBeResolvedTo(monday);
  });

  it(".copyRecursive() can copy directories recursively", async () => {
    let targetDir = await tempDir.getDirectoryHandle("copyDirTarget", createOptions);
    await FileSystemUtilities.copyDirectoryRecursive(tempDir, "fixtures", targetDir);

    targetDir = await targetDir.getDirectoryHandle("fixtures");
    const redDir = await targetDir.getDirectoryHandle("red");
    const circleDir = await redDir.getDirectoryHandle("circle");
    await expectAsync(FileSystemUtilities.readContents(circleDir, "radius")).toBeResolvedTo(circleRadius);
    await expectAsync(FileSystemUtilities.readContents(circleDir, "coordinates")).toBeResolvedTo(circleCoords);

    await expectAsync(FileSystemUtilities.readContents(redDir, "rectangle.json")).toBeResolvedTo(rectangleJSON);

    const blueDir = await targetDir.getDirectoryHandle("blue");
    await expectAsync(FileSystemUtilities.readContents(blueDir, "monday")).toBeResolvedTo(monday);
  });
});
