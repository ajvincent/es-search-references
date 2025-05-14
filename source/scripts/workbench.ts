//#region preamble
import {
  FileMapView
} from "./codemirror/views/FileMapView.js";

import {
  FileSystemCallbacks,
  FileSystemController,
} from "./file-system/controller.js";

import {
  FileUploadsView
} from "./file-system/views/uploads.js";

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
  FileSystemMap
} from "./storage/FileSystemMap.js";

import {
  OutputController
} from "./reports/outputController.js";

import {
  ReportSelectController
} from "./reports/selectController.js";

import {
  GenericPanelView
} from "./tab-panels/panelView.js";
//#endregion preamble

class Workbench_Base implements FileSystemCallbacks {
  readonly #fsSelector: HTMLSelectElement;

  #fileSystems?: Map<string, FileSystemMap>;
  #fileSystemControlsLeftView?: GenericPanelView;
  #fileUploadsView?: FileUploadsView;
  #currentFileMap: Map<string, string>;
  #refSpecFS?: FileSystemController;
  #outputController?: OutputController;
  #reportSelectorController?: ReportSelectController;

  #codeMirrorPanels?: TabPanelsView;
  #fileSystemPanels?: TabPanelsView;
  #fileMapView?: FileMapView;

  #filesCheckedMap = new WeakMap<ReadonlyMap<string, string>, Set<string>>;
  #lastRunSpan?: HTMLElement;

  constructor() {
    this.#fsSelector = document.getElementById("workspace-selector") as HTMLSelectElement;
    this.#currentFileMap = ReferenceSpecFileMap;
    this.#filesCheckedMap.set(ReferenceSpecFileMap, new Set);

    window.onload = () => this.#initialize();
  }

  fileSelected(pathToFile: string): void {
    this.#fileMapView!.selectFile(pathToFile);
  }

  fileCheckToggled(pathToFile: string, isChecked: boolean): void {
    const fileSet = this.#filesCheckedMap.get(this.#currentFileMap)!;
    if (isChecked)
      fileSet.add(pathToFile);
    else
      fileSet.delete(pathToFile);
  }

  #initialize(): void {
    this.#fillFileSystemPanels();

    this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");
    this.#fileMapView = new FileMapView(this.#currentFileMap, "reference-spec-editors");
    this.#codeMirrorPanels.addPanel("reference-spec-filesystem", this.#fileMapView);
    this.#codeMirrorPanels.addPanel("filesystem-controls", new GenericPanelView("filesystem-controls-right"));
    this.#codeMirrorPanels.activeViewKey = "reference-spec-filesystem";

    this.#outputController = new OutputController;
    this.#reportSelectorController = new ReportSelectController(
      "report-selector", this.#outputController
    );

    this.#lastRunSpan = document.getElementById("lastRun")!;

    this.#attachEvents();
    this.#fsSelector.value = "reference-spec-filesystem";
  }

  #fillFileSystemPanels() {
    this.#fileSystemPanels = new TabPanelsView("filesystem-selector");

    this.#refSpecFS = new FileSystemController("reference-spec-filesystem", true, this);
    this.#refSpecFS.setFileMap(ReferenceSpecFileMap);
    this.#fileSystemPanels.addPanel("reference-spec-filesystem", this.#refSpecFS);
    this.#fileSystemPanels.activeViewKey = "reference-spec-filesystem";

    this.#fileSystemControlsLeftView = new GenericPanelView("filesystem-controls-left");
    this.#fileSystemPanels.addPanel("filesystem-controls", this.#fileSystemControlsLeftView);
    this.#fileUploadsView = new FileUploadsView();

    this.#fileSystems = FileSystemMap.getAll();
    for (const [systemKey, fileSystem] of this.#fileSystems) {

    }
  }

  async #runSearches(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    this.#outputController!.clearResults();
    this.#updateFileMap();

    const driver = new SearchDriver(this.#currentFileMap);
    const fileSet = this.#filesCheckedMap.get(this.#currentFileMap)!;
    const resultsMap: ReadonlyMap<string, ReadonlyMap<string, SearchResults>> = await driver.run(Array.from(fileSet));

    this.#outputController!.addResults(resultsMap);
    this.#reportSelectorController!.refreshTree();

    this.#lastRunSpan!.replaceChildren((new Date()).toLocaleString());
  }

  #updateFileMap(): void {
    this.#fileMapView!.updateFileMap();
  }

  #attachEvents(): void {
    document.getElementById("runSearchesButton")!.onclick = this.#runSearches.bind(this);
    const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector)) as HTMLElement[];
    for (const tab of tabs) {
      tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey!);
    }

    this.#fsSelector.onchange = this.#onWorkspaceSelect.bind(this);

    document.getElementById("uploadFiles")!.onclick = this.#doFileUpload.bind(this);
  }

  #selectOutputReportTab(tabKey: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.#outputController?.selectTabKey(tabKey);
  }

  #onWorkspaceSelect(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const { value } = this.#fsSelector;
    if (value === "filesystem-controls") {
      this.#fileSystemPanels!.activeViewKey = "filesystem-controls";
      this.#codeMirrorPanels!.activeViewKey = "filesystem-controls";
      return;
    }

    if (value === "reference-spec-filesystem") {
      this.#currentFileMap = ReferenceSpecFileMap;
      this.#fileSystemPanels!.activeViewKey = "reference-spec-filesystem";
      this.#codeMirrorPanels!.activeViewKey = "";
      return;
    }
  }

  #doFileUpload(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.#fileUploadsView!.getFiles();
    this.#fileUploadsView!.displayElement.reset();
  }
}

const Workbench = new Workbench_Base();
export { Workbench };
