import type {
  FileSystemClipboardIfc
} from "../../../scripts/storage/types/FileSystemClipboardIfc.js";

import {
  FileSystemClipboard
} from "../../../scripts/storage/FileSystemClipboard.js";

import {
  FileSystemUtilities
} from "../../../scripts/storage/FileSystemUtilities.js";

import {
  getTempDirAndCleanup
} from "../helpers/TempDirectories.js";

xdescribe("FileSystemClipboard", () => {
  const dirPromise = getTempDirAndCleanup("FileSystemClipboard");
  let tempDir: FileSystemDirectoryHandle;
  let fixturesDir: FileSystemDirectoryHandle;

  beforeAll(async () => {
    tempDir = await dirPromise;

    const createOptions = { create: true };
    const circleRadius = "4", circleCoords = "(5, 3)", rectangleJSON = "{ x: 20, y: 20, width: 40, height: 30 }";
    const monday = "How does it feel?";

    fixturesDir = await tempDir.getDirectoryHandle("fixtures", createOptions);
    const redDir = await fixturesDir.getDirectoryHandle("red", createOptions);
    const circleDir = await redDir.getDirectoryHandle("circle", createOptions);
    const blueDir = await fixturesDir.getDirectoryHandle("blue", createOptions);

    await Promise.all([
      FileSystemUtilities.writeContents(circleDir, "radius", circleRadius),
      FileSystemUtilities.writeContents(circleDir, "coordinates", circleCoords),
      FileSystemUtilities.writeContents(redDir, "rectangle.json", rectangleJSON),
      FileSystemUtilities.writeContents(blueDir, "monday", monday)
    ]);
  });

  xit("in progress", async () => {
    fail("not implemented");
  });
});
