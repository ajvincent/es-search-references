//#region preamble
import {
  FileEditorMapView
} from "../../../scripts/codemirror/views/FileEditorMapView.js";

import {
  OPFSFrontEnd
} from "../../../scripts/opfs/client/FrontEnd.js";

import type {
  OPFSWebFileSystemIfc
} from "../../../scripts/opfs/types/WebFileSystemIfc.js";

import {
  mockDirectories
} from "../fixtures/mockDirectories.js";

import {
  getTempDirAndCleanup,
  getResolvedTempDirPath
} from "../helpers/TempDirectories.js";

import {
  getTempFieldset
} from "../helpers/TempFieldset.js";
//#endregion preamble

describe("FileEditorMapView", () => {
  const dirPromise = getTempDirAndCleanup("codemirror_FileEditorMapView");
  const pathToTempDir = getResolvedTempDirPath("codemirror_FileEditorMapView");
  let tempDir: FileSystemDirectoryHandle;
  let webFS: OPFSWebFileSystemIfc;
  let fieldset: HTMLFieldSetElement;

  beforeAll(async () => {
    tempDir = await dirPromise;
    const frontEnd: OPFSFrontEnd = await OPFSFrontEnd.build(pathToTempDir);
    const uuid = await frontEnd.buildEmpty("FileEditorMapView");
    webFS = await frontEnd.getWebFS(uuid);

    await webFS.importDirectoryRecord(mockDirectories);

    fieldset = getTempFieldset("FileEditorMapView");
  });

  it("provides CodeMirror editors and shows the right one", async () => {
    const mapView = new FileEditorMapView("FileEditorMapView-test", false, fieldset, webFS);

    await Promise.all([
      mapView.addEditorForPath("one://two/three.js", true),
      mapView.addEditorForPath("one://two/four.js", true),
      mapView.addEditorForPath("seven://eight.js", false),
    ]);

    expect(mapView.hasEditorForPath("one://two/three.js")).toBeTrue();
    expect(mapView.hasEditorForPath("seven://nine.js")).toBeFalse();

    mapView.selectFile("one://two/three.js");
    {
      const activeElement = fieldset.querySelector(".active") as HTMLElement;
      expect(activeElement.dataset.pathtofile).toBe("one://two/three.js");
    }

    mapView.selectFile("seven://eight.js");
    {
      const activeElement = fieldset.querySelector(".active") as HTMLElement;
      expect(activeElement.dataset.pathtofile).toBe("seven://eight.js");
    }

    mapView.dispose();
    expect(mapView.hasEditorForPath("one://two/three.js")).toBeFalse();
  });

  afterAll(() => fieldset.remove());
});
