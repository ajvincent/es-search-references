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
} from "./reports/outputController.js";

import {
  ReportSelectController
} from "./reports/selectController.js";

class Workbench_Base implements FileSystemCallbacks {
  /*
  readonly #fsSelector: HTMLSelectElement;
  */

  #fileMap: ReadonlyMap<string, string>;
  #refSpecFS?: FileSystemController;
  #outputController?: OutputController;
  #reportSelectorController?: ReportSelectController;
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
    this.#outputController = new OutputController;
    this.#reportSelectorController = new ReportSelectController(
      "report-selector", this.#outputController
    );

    this.#attachEvents();
  }

  #attachEvents(): void {
    document.getElementById("runSearchesButton")!.onclick = this.#runSearches.bind(this);
    const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector)) as HTMLElement[];
    for (const tab of tabs) {
      tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey!);
    }

    /*
    document.getElementById("testButton")?.onclick = () => this.#doTestAction();
    */
  }

  async #runSearches(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    this.#outputController!.clearResults();

    const driver = new SearchDriver(this.#fileMap);
    const fileSet = this.#filesCheckedMap.get(this.#fileMap)!;
    const resultsMap: ReadonlyMap<string, ReadonlyMap<string, SearchResults>> = await driver.run(Array.from(fileSet));

    this.#outputController!.addResults(resultsMap);
    this.#reportSelectorController!.refreshTree();
  }

  #selectOutputReportTab(tabKey: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.#outputController?.selectTabKey(tabKey);
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
