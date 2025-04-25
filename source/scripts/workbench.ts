import {
  ReferenceSpecFileMap
} from "./reference-spec/FileMap.js";

import {
  FileSystemCallbacks,
  FileSystemController
} from "./file-system/controller.js";

class Workbench_Base implements FileSystemCallbacks {
  /*
  readonly #fsSelector: HTMLSelectElement;
  */

  #fileMap: ReadonlyMap<string, string>;
  #refSpecFS?: FileSystemController;

  constructor() {
    /*
    this.#fsSelector = document.getElementById("workspace-selector") as HTMLSelectElement;
    */
    this.#fileMap = ReferenceSpecFileMap;

    window.onload = () => this.#initialize();
  }

  fileSelected(pathToFile: string): void {
    console.log("fileSelected: pathToFile = " + pathToFile);
  }
  fileCheckToggled(pathToFile: string, isChecked: boolean): void {
    console.log("fileCheckToggled: pathToFile = " + pathToFile + ", isChecked = " + isChecked);
  }

  #initialize(): void {
    this.#attachTestEvent();
  }

  #attachTestEvent(): void {
    document.getElementById("testButton")!.onclick = () => this.#doTestAction();
  }

  #doTestAction(): void {
    debugger;
    this.#refSpecFS = new FileSystemController("filesystem:reference-spec", this);
    this.#refSpecFS.setFileMap(ReferenceSpecFileMap);
  }

  /*
  #attachEvents() {
    this.#fsSelector.onchange = () => this.#onWorkspaceSelect();
  }

  #onWorkspaceSelect(): void {
    const { value } = this.#fsSelector;
    if (value === "reference-spec") {
      this.#fileMap = ReferenceSpecFileMap;
    }
  }
  */
}

const Workbench = new Workbench_Base();
export { Workbench };
