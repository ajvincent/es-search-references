import {
  ReferenceSpecFileMap
} from "./reference-spec/FileMap.js";

import {
  FileSystemCallbacks,
  FileSystemController,
} from "./file-system/controller.js";

import {
  TabPanelsView,
} from "./other/tab-panels-view.js";

class Workbench_Base implements FileSystemCallbacks {
  /*
  readonly #fsSelector: HTMLSelectElement;
  */

  #fileMap: ReadonlyMap<string, string>;
  #refSpecFS?: FileSystemController;
  #outputLogsView?: TabPanelsView;
  #codeMirrorView?: TabPanelsView;

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
    this.#refSpecFS = new FileSystemController("filesystem:reference-spec", true, this);
    this.#refSpecFS.setFileMap(ReferenceSpecFileMap);

    this.#outputLogsView = new TabPanelsView("output-logs");
    this.#codeMirrorView = new TabPanelsView("codemirror-panels");

    document.getElementById("testButton")!.onclick = () => this.#doTestAction();
  }

  #doTestAction(): void {
    /*
    const panel = document.createElement("output-panel");
    const date = new Date();
    panel.append(`This is child number ${
      document.getElementById("output-logs")!.children.length
    }, created at ${date.toISOString()}.`);
    const key = "foo-" + date.toISOString();
    this.#outputLogsView!.addPanel(key, {displayElement: panel});
    this.#outputLogsView!.activeViewKey = key;
    */
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
