import {
  FileMapView
} from "./codemirror/views/FileMapView.js";

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

  #fileMap: Map<string, string>;
  #refSpecFS?: FileSystemController;
  #outputController?: OutputController;
  #reportSelectorController?: ReportSelectController;

  #codeMirrorPanels?: TabPanelsView;
  #fileMapView?: FileMapView;

  #filesCheckedMap = new WeakMap<ReadonlyMap<string, string>, Set<string>>;
  #lastRunSpan?: HTMLElement;

  constructor() {
    /*
    this.#fsSelector = document.getElementById("workspace-selector") as HTMLSelectElement;
    */
    this.#fileMap = ReferenceSpecFileMap;
    this.#filesCheckedMap.set(ReferenceSpecFileMap, new Set);

    window.onload = () => this.#initialize();
  }

  fileSelected(pathToFile: string): void {
    this.#fileMapView!.selectFile(pathToFile);
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

    this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");
    this.#fileMapView = new FileMapView(this.#fileMap, "reference-spec-editors");
    this.#codeMirrorPanels.addPanel("reference-spec", this.#fileMapView);
    this.#codeMirrorPanels.activeViewKey = "reference-spec";

    this.#outputController = new OutputController;
    this.#reportSelectorController = new ReportSelectController(
      "report-selector", this.#outputController
    );

    this.#lastRunSpan = document.getElementById("lastRun")!;

    this.#attachEvents();
  }

  #attachEvents(): void {
    document.getElementById("runSearchesButton")!.onclick = this.#runSearches.bind(this);
    const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector)) as HTMLElement[];
    for (const tab of tabs) {
      tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey!);
    }
  }

  async #runSearches(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    this.#outputController!.clearResults();
    this.#updateFileMap();

    const driver = new SearchDriver(this.#fileMap);
    const fileSet = this.#filesCheckedMap.get(this.#fileMap)!;
    const resultsMap: ReadonlyMap<string, ReadonlyMap<string, SearchResults>> = await driver.run(Array.from(fileSet));

    this.#outputController!.addResults(resultsMap);
    this.#reportSelectorController!.refreshTree();

    this.#lastRunSpan!.replaceChildren((new Date()).toLocaleString());
  }

  #updateFileMap(): void {
    this.#fileMapView!.updateFileMap();
  }

  #selectOutputReportTab(tabKey: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.#outputController?.selectTabKey(tabKey);
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
