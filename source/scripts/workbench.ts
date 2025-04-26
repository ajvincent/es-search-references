import {
  FileSystemCallbacks,
  FileSystemController,
} from "./file-system/controller.js";

import {
  TabPanelsView,
} from "./tab-panels/tab-panels-view.js";

import {
  ReferenceSpecFileMap
} from "./reference-spec/FileMap.js";

import {
  SearchDriver
} from "./search/Driver.js";

import type {
  SearchResults
} from "./search/Results.js";

import {
  OutputController
} from "./tab-panels/outputController.js";

class Workbench_Base implements FileSystemCallbacks {
  /*
  readonly #fsSelector: HTMLSelectElement;
  */

  #fileMap: ReadonlyMap<string, string>;
  #refSpecFS?: FileSystemController;
  readonly #outputController = new OutputController;
  #codeMirrorView?: TabPanelsView;
  #filesCheckedMap = new WeakMap<ReadonlyMap<string, string>, Set<string>>;

  constructor() {
    /*
    this.#fsSelector = document.getElementById("workspace-selector") as HTMLSelectElement;
    */
    this.#fileMap = ReferenceSpecFileMap;
    this.#filesCheckedMap.set(ReferenceSpecFileMap, new Set);

    window.onload = () => this.#initialize();
  }

  fileSelected(pathToFile: string): void {
    console.log("fileSelected: pathToFile = " + pathToFile);
  }
  fileCheckToggled(pathToFile: string, isChecked: boolean): void {
    const fileSet = this.#filesCheckedMap.get(this.#fileMap)!;
    if (isChecked)
      fileSet.add(pathToFile);
    else
      fileSet.delete(pathToFile);
  }

  #initialize(): void {
    this.#refSpecFS = new FileSystemController("filesystem:reference-spec", true, this);
    this.#refSpecFS.setFileMap(ReferenceSpecFileMap);

    this.#codeMirrorView = new TabPanelsView("codemirror-panels");

    this.#attachEvents();
    document.getElementById("testButton")!.onclick = () => this.#doTestAction();
  }

  #attachEvents(): void {
    document.getElementById("runSearchesButton")!.onclick = this.#runSearches.bind(this);
  }

  async #runSearches(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    this.#outputController.clearResults();

    const driver = new SearchDriver(this.#fileMap);
    const fileSet = this.#filesCheckedMap.get(this.#fileMap)!;
    const resultsMap: ReadonlyMap<string, ReadonlyMap<string, SearchResults>> = await driver.run(Array.from(fileSet));

    this.#outputController.addResults(resultsMap);
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
