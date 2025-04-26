import {
  graphlib
} from "./dagre-imports.js";

import {
  FileSystemCallbacks,
  FileSystemController,
} from "./file-system/controller.js";

import {
  TabPanelsView,
} from "./other/tab-panels-view.js";

import {
  ReferenceSpecFileMap
} from "./reference-spec/FileMap.js";

import {
  SearchDriver
} from "./search/Driver.js";

import type {
  SearchResults
} from "./search/Results.js";

class Workbench_Base implements FileSystemCallbacks {
  /*
  readonly #fsSelector: HTMLSelectElement;
  */

  #fileMap: ReadonlyMap<string, string>;
  #refSpecFS?: FileSystemController;
  #outputLogsView?: TabPanelsView;
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

    this.#outputLogsView = new TabPanelsView("output-logs");
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

    this.#outputLogsView!.clearPanels();

    const driver = new SearchDriver(this.#fileMap);
    const fileSet = this.#filesCheckedMap.get(this.#fileMap)!;
    const resultsMap: ReadonlyMap<string, ReadonlyMap<string, SearchResults>> = await driver.run(Array.from(fileSet));

    resultsMap.forEach((innerResults, pathToFile) => {
      innerResults.forEach((result, searchKey) => {
        this.#addLogPanel(pathToFile, searchKey, result);
        this.#addRawGraphPanel(pathToFile, searchKey, result);
      });
    });
  }

  #addLogPanel(pathToFile: string, searchKey: string, result: SearchResults): string {
    const serializedLog = result.logs.join("\n");
    const pre = document.createElement("pre");
    pre.append(serializedLog);

    const hash = JSON.stringify({pathToFile, searchKey, tabKey: "searchLog"});
    const view = { displayElement: pre };
    this.#outputLogsView!.addPanel(hash, view);
    this.#outputLogsView!.activeViewKey = hash;
    return hash;
  }

  #addRawGraphPanel(pathToFile: string, searchKey: string, result: SearchResults): string {
    const serializedGraph = result.graph ? JSON.stringify(graphlib.json.write(result.graph), null, 2) : "(null)";
    const pre = document.createElement("pre");
    pre.append(serializedGraph);

    const hash = JSON.stringify({pathToFile, searchKey, tabKey: "searchResults"});
    const view = { displayElement: pre };
    this.#outputLogsView!.addPanel(hash, view);
    this.#outputLogsView!.activeViewKey = hash;
    return hash;
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
