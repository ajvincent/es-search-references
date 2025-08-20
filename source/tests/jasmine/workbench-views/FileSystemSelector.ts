import {
  FileSystemSetController
} from "../../../scripts/file-system/setController.js";

import {
  OPFSFrontEnd
} from "../../../scripts/opfs/client/FrontEnd.js";

import type {
  UUID
} from "../../../scripts/opfs/types/messages.js";

import {
  FileSystemSelectorView
} from "../../../scripts/workbench-views/FileSystemSelector.js";

import {
  getTempDirAndCleanup,
  getResolvedTempDirPath
} from "../helpers/TempDirectories.js";

import {
  getTempFieldset
} from "../helpers/TempFieldset.js";

describe("FileSystemSelectorView", () => {
  const dirPromise = getTempDirAndCleanup("opfs_FrontEnd");
  const pathToTempDir = getResolvedTempDirPath("opfs_FrontEnd");
  let tempDir: FileSystemDirectoryHandle;
  let frontEnd: OPFSFrontEnd;

  let fieldset: HTMLFieldSetElement;
  let selectElement: HTMLSelectElement;
  let controlsOption: HTMLOptionElement;

  beforeAll(async () => {
    tempDir = await dirPromise;
    frontEnd = await OPFSFrontEnd.build(pathToTempDir);

    fieldset = getTempFieldset("FileSystemSelectorView tests");
    selectElement = document.createElement("select");
    controlsOption = document.createElement("option");
    controlsOption.value = "filesystem-controls";
    controlsOption.append("File system controls");
    selectElement.append(controlsOption);
    fieldset.append(selectElement);
  });

  it("can reflect real file systems and execute callbacks", async () => {
    const controlsSpy = jasmine.createSpy();
    const selectSpy = jasmine.createSpy();

    function resetPending(): void {
      controlsSpy.calls.reset();
      selectSpy.calls.reset();
    }

    const view = new FileSystemSelectorView(
      selectElement,
      uuid => selectSpy(uuid),
      () => controlsSpy(""),
    );

    const fooUUID: UUID = await frontEnd.buildEmpty("foo");
    const referenceUUID: UUID = await frontEnd.buildEmpty(FileSystemSetController.referenceFSLabel);
    const barUUID: UUID = await frontEnd.buildEmpty("bar");

    await view.fillOptions(frontEnd);
    {
      const { options } = selectElement;
      expect(options.length).toBe(4);
      expect(options[0].text).toBe(FileSystemSetController.referenceFSLabel);
      expect(options[1].text).toBe("File system controls");
      expect(options[2].text).toBe("bar");
      expect(options[3].text).toBe("foo");
    }

    resetPending();
    selectElement.selectedIndex = 0;
    selectElement.dispatchEvent(new Event("change"));
    expect(selectSpy).toHaveBeenCalledOnceWith(referenceUUID)
    expect(controlsSpy).not.toHaveBeenCalled();
    selectSpy.calls.reset();
    controlsSpy.calls.reset();

    resetPending();
    selectElement.selectedIndex = 1;
    selectElement.dispatchEvent(new Event("change"));
    expect(selectSpy).not.toHaveBeenCalled();
    expect(controlsSpy).toHaveBeenCalledOnceWith("");

    resetPending();
    selectElement.selectedIndex = 2;
    selectElement.dispatchEvent(new Event("change"));
    expect(selectSpy).toHaveBeenCalledOnceWith(barUUID);
    expect(controlsSpy).not.toHaveBeenCalled();

    resetPending();
    selectElement.selectedIndex = 3;
    selectElement.dispatchEvent(new Event("change"));
    expect(selectSpy).toHaveBeenCalledOnceWith(fooUUID);
    expect(controlsSpy).not.toHaveBeenCalled();
  });

  afterAll(() => {
    fieldset.remove();
  });
});
