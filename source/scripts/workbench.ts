//#region preamble
import {
  FileMapView
} from "./codemirror/views/FileMapView.js";

import {
  FileSystemCallbacks,
  FileSystemController,
} from "./file-system/controller.js";

import {
  FileSystemElement
} from "./file-system/elements/file-system.js";

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
  #refSpecFS?: FileSystemController;
  #outputController?: OutputController;
  #reportSelectorController?: ReportSelectController;

  readonly #fsSelector: HTMLSelectElement;
  #fileSystems?: Map<string, FileSystemMap>;
  #fileSystemControlsLeftView?: GenericPanelView;
  #fileUploadsView?: FileUploadsView;
  #currentFileMap: Map<string, string>;
  #fsToOptionMap = new WeakMap<FileSystemMap, HTMLOptionElement>;

  #codeMirrorPanels?: TabPanelsView;
  #fileSystemPanels?: TabPanelsView;
  #referenceFileMapView?: FileMapView;

  #filesCheckedMap = new WeakMap<ReadonlyMap<string, string>, Set<string>>;
  #lastRunSpan?: HTMLElement;

  constructor() {
    this.#fsSelector = document.getElementById("workspace-selector") as HTMLSelectElement;
    this.#currentFileMap = ReferenceSpecFileMap;
    this.#filesCheckedMap.set(ReferenceSpecFileMap, new Set);

    window.onload = () => this.#initialize();
  }

  fileSelected(controller: FileSystemController, pathToFile: string): void {
    this.#referenceFileMapView!.selectFile(pathToFile);
  }

  fileCheckToggled(controller: FileSystemController, pathToFile: string, isChecked: boolean): void {
    const fileSet = this.#filesCheckedMap.get(this.#currentFileMap)!;
    if (isChecked)
      fileSet.add(pathToFile);
    else
      fileSet.delete(pathToFile);
  }

  async #initialize(): Promise<void> {
    this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");

    await this.#fillFileSystemPanels();

    this.#referenceFileMapView = new FileMapView(this.#currentFileMap, "reference-spec-editors");
    this.#codeMirrorPanels.addPanel("reference-spec-filesystem", this.#referenceFileMapView);
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

  async #fillFileSystemPanels(): Promise<void> {
    this.#fileSystemPanels = new TabPanelsView("filesystem-selector");

    this.#refSpecFS = new FileSystemController("reference-spec-filesystem", true, this);
    this.#refSpecFS.setFileMap(ReferenceSpecFileMap);
    this.#fileSystemPanels.addPanel("reference-spec-filesystem", this.#refSpecFS);
    this.#fileSystemPanels.activeViewKey = "reference-spec-filesystem";

    this.#fileSystemControlsLeftView = new GenericPanelView("filesystem-controls-left");
    this.#fileSystemPanels.addPanel("filesystem-controls", this.#fileSystemControlsLeftView);
    this.#fileUploadsView = new FileUploadsView();

    this.#fileSystems = FileSystemMap.getAll();

    const optionPromises: Promise<HTMLOptionElement>[] = [];
    for (const [systemKey, fileSystem] of this.#fileSystems) {
      optionPromises.push(this.#addFileSystemOption(systemKey, fileSystem));
    }
    const options = await Promise.all(optionPromises);

    options.sort((a, b) => a.text.localeCompare(b.text));
    this.#fsSelector.append(...options);
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
    this.#referenceFileMapView!.updateFileMap();
  }

  #attachEvents(): void {
    document.getElementById("runSearchesButton")!.onclick = this.#runSearches.bind(this);
    const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector)) as HTMLElement[];
    for (const tab of tabs) {
      tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey!);
    }

    this.#fsSelector.onchange = this.#onWorkspaceSelect.bind(this);
    this.#fileUploadsView!.displayElement.onsubmit = this.#doFileUpload.bind(this);
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

    const systemKey = value.replace(/^filesystem:/, "");
    this.#currentFileMap = this.#fileSystems!.get(systemKey)!;
    this.#fileSystemPanels!.activeViewKey = value;
    this.#codeMirrorPanels!.activeViewKey = "";
  }

  async #doFileUpload(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const targetFileSystem: string = this.#fileUploadsView!.getSelectedFileSystem();
    const newFileEntries: [string, string][] = await this.#fileUploadsView!.getFileEntries();
    this.#fileUploadsView!.displayElement.reset();

    const fileSystems = this.#fileSystems!;
    let fs: FileSystemMap | undefined = fileSystems.get(targetFileSystem);
    if (fs) {
      fs.batchUpdate(() => {
        for (const [pathToFile, contents] of newFileEntries) {
          fs!.set(pathToFile, contents);
        }
      });
    } else {
      fs = new FileSystemMap(targetFileSystem, newFileEntries);
      fileSystems.set(targetFileSystem, fs);

      const option: HTMLOptionElement = await this.#addFileSystemOption(targetFileSystem, fs);
      let referenceOption: HTMLOptionElement | null = null;
      for (const currentOption of Array.from(this.#fsSelector.options).slice(2)) {
        if (targetFileSystem.localeCompare(currentOption.text) < 0) {
          referenceOption = currentOption;
          break;
        }
      }

      this.#fsSelector.options.add(option, referenceOption);
      this.#fsToOptionMap.set(fs, option);
    }

    this.#fsSelector.value = this.#fsToOptionMap.get(fs)!.value;
  }

  async #addFileSystemOption(
    systemKey: string,
    fileSystem: FileSystemMap
  ): Promise<HTMLOptionElement>
  {
    const option: HTMLOptionElement = document.createElement("option");
    option.value = "filesystem:" + systemKey;
    option.append(systemKey);

    const fsDisplayElement = new FileSystemElement();
    fsDisplayElement.id = option.value;
    this.#fileSystemPanels!.rootElement.append(fsDisplayElement);
    const fsController = new FileSystemController(option.value, false, this);
    this.#fileSystemPanels!.addPanel(option.value, fsController);
    this.#codeMirrorPanels!.addPanel(option.value, new FileMapView(fileSystem, option.value));

    fsDisplayElement.connectedPromise.then(() => {
      fsController.setFileMap(fileSystem);
    });

    return option;
  }
}

const Workbench = new Workbench_Base();
export { Workbench };
