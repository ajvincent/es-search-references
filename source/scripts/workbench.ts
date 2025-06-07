//#region preamble
import {
  FileSystemController,
} from "./file-system/controller.js";

import {
  FileSystemElement
} from "./file-system/elements/file-system.js";

import {
  FileSystemSetController,
  ValidFileOperations
} from "./file-system/setController.js";

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
  type ExportedFileSystem,
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

import type {
  OrderedKeyMap
} from "./utilities/OrderedKeyMap.js";
//#endregion preamble

interface ClassClickDetails {
  classSpecifier: string;
  classLineNumber: number;
}

class Workbench_Base {
  #outputController?: OutputController;
  #reportSelectorController?: ReportSelectController;

  readonly #displayElement: HTMLDivElement;

  readonly #fsSelector: HTMLSelectElement;
  readonly #fileSystemToControllerMap = new Map<string, FileSystemController>;

  #fileSystemControlsLeftView?: GenericPanelView;
  #fileSystemSetController?: FileSystemSetController;

  #codeMirrorPanels?: TabPanelsView;
  #fileSystemPanels?: TabPanelsView;

  #lastRunSpan?: HTMLElement;

  constructor() {
    this.#displayElement = document.getElementById("workbench") as HTMLDivElement;
    this.#fsSelector = document.getElementById("workspace-selector") as HTMLSelectElement;
    window.onload = () => this.#initialize();
  }

  async #initialize(): Promise<void> {
    this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");

    await this.#fillFileSystemPanels();

    this.#codeMirrorPanels.addPanel("filesystem-controls", this.#fileSystemSetController!.view);
    this.#codeMirrorPanels.activeViewKey = "reference-spec-filesystem";

    this.#outputController = new OutputController;
    this.#reportSelectorController = new ReportSelectController(
      "report-selector", this.#outputController
    );

    this.#lastRunSpan = document.getElementById("lastRun")!;

    this.#attachEvents();
  }

  async #fillFileSystemPanels(): Promise<void> {
    this.#fileSystemPanels = new TabPanelsView("filesystem-selector");

    const refSpecOption: HTMLOptionElement = await this.#addFileSystemOption(
      "reference-spec-filesystem", ReferenceSpecFileMap, true
    );

    this.#fileSystemControlsLeftView = new GenericPanelView("filesystem-controls-left", false);
    this.#fileSystemPanels.addPanel("filesystem-controls", this.#fileSystemControlsLeftView);
    this.#fileSystemSetController = new FileSystemSetController();

    const fileSystems: OrderedKeyMap<FileSystemMap> = FileSystemMap.getAll();

    const optionPromises: Promise<HTMLOptionElement>[] = [];
    for (const [systemKey, fileSystem] of fileSystems) {
      optionPromises.push(this.#addFileSystemOption(systemKey, fileSystem, false));
    }
    const options = await Promise.all(optionPromises);
    this.#fsSelector.append(refSpecOption, ...options);

    this.#fsSelector.value = "reference-spec-filesystem";

    this.#fileSystemSetController.reset();
    this.#onWorkspaceSelect();
  }

  #getCurrentFSController(): FileSystemController | undefined {
    return this.#fileSystemToControllerMap.get(this.#fsSelector.value);
  }

  async #runSearches(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    this.#reportSelectorController!.clear();
    this.#outputController!.clearResults();
    const fsController: FileSystemController | undefined = this.#getCurrentFSController();
    if (!fsController) {
      return;
    }

    fsController.updateFileMap();

    const driver = new SearchDriver(fsController!.fileMap);
    const fileSet = fsController!.filesCheckedSet;
    const resultsMap: ReadonlyMap<string, ReadonlyMap<string, SearchResults>> = await driver.run(Array.from(fileSet));

    this.#outputController!.addResults(resultsMap);
    this.#reportSelectorController!.refreshTree();

    this.#lastRunSpan!.replaceChildren((new Date()).toLocaleString());
  }

  #attachEvents(): void {
    document.getElementById("runSearchesButton")!.onclick = this.#runSearches.bind(this);
    const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector)) as HTMLElement[];
    for (const tab of tabs) {
      tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey!);
    }

    this.#fsSelector.onchange = this.#onWorkspaceSelect.bind(this);
    this.#fileSystemSetController!.form.onsubmit = this.#onFileSetControllerSubmit.bind(this);

    this.#displayElement.addEventListener(
      "classClick",
      (event) => this.#handleClassClick(event as CustomEvent),
      { capture: true, passive: true }
    );
  }

  #selectOutputReportTab(tabKey: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.#outputController?.selectTabKey(tabKey);
  }

  #onWorkspaceSelect(event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();

    const fsController: FileSystemController | undefined = this.#getCurrentFSController();
    if (fsController) {
      fsController.updateFileMap();
    }

    const { value } = this.#fsSelector;
    this.#fileSystemPanels!.activeViewKey = "fss:" + value;
    this.#codeMirrorPanels!.activeViewKey = value;

    this.#reportSelectorController?.clear();
    this.#outputController?.clearResults();
  }

  async #onFileSetControllerSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    switch (this.#fileSystemSetController!.selectedOperation) {
      case ValidFileOperations.clone:
        await this.#doFileSystemClone();
        break;
      case ValidFileOperations.upload:
        await this.#doFileSystemUpload();
        break;
      case ValidFileOperations.rename: {
        await this.#doFileSystemClone();
        await this.#doFileSystemDelete(true);
        break;
      }
      case ValidFileOperations.export:
        await this.#doFileSystemExport();
        break;
      case ValidFileOperations.delete: {
        await this.#doFileSystemDelete(false);
        break;
      }

      default:
        return Promise.reject(new Error("unsupported operation"));
    }

    this.#fileSystemSetController!.reset();
  }

  async #doFileSystemClone(): Promise<void> {
    const sourceFileSystem: string = this.#fileSystemSetController!.getSourceFileSystem();
    const targetFileSystem: string = this.#fileSystemSetController!.getTargetFileSystem();

    const sourceFS: FileSystemMap = this.#fileSystemToControllerMap.get(sourceFileSystem)!.fileMap;
    const targetFS: FileSystemMap = sourceFS.clone(targetFileSystem);

    const option = await this.#addFileSystemOption(targetFileSystem, targetFS, false);
    this.#insertFileSystemOption(option);

    this.#fsSelector.value = targetFileSystem;
  }

  async #doFileSystemUpload(): Promise<void> {
    const targetFileSystem: string = this.#fileSystemSetController!.getTargetFileSystem();

    const newFileEntries: [string, string][] = await this.#fileSystemSetController!.getFileEntries();
    this.#fileSystemSetController!.form.reset();

    let fs = this.#fileSystemToControllerMap.get(targetFileSystem)?.fileMap as FileSystemMap | undefined;
    if (fs) {
      fs.batchUpdate(() => {
        for (const [pathToFile, contents] of newFileEntries) {
          fs!.set(pathToFile, contents);
        }
      });
    } else {
      if (newFileEntries.every(pathAndContents => pathAndContents[0] !== "es-search-references/guest")) {
        const guestFile = this.#fileSystemToControllerMap.get("reference-spec-filesystem")?.fileMap.get("es-search-references/guest");
        if (!guestFile) {
          throw new Error("no guest file?");
        }
        newFileEntries.push(["es-search-references/guest", guestFile]);
      }

      const fs = new FileSystemMap(targetFileSystem, newFileEntries);

      const option: HTMLOptionElement = await this.#addFileSystemOption(targetFileSystem, fs, false);
      this.#insertFileSystemOption(option);
    }

    this.#fsSelector.value = targetFileSystem;
  }

  async #doFileSystemDelete(isRename: boolean): Promise<void> {
    const systemKey = this.#fileSystemSetController!.getSourceFileSystem();
    if (!isRename) {
      const ok = window.confirm(`Are you sure you want to delete the "${systemKey} file system?  This operation is irreversible!`);
      if (!ok)
        return;
    }

    const fsController: FileSystemController = this.#fileSystemToControllerMap.get(systemKey)!;
    fsController.fileMap.clear();

    fsController.dispose();
    this.#fileSystemToControllerMap.delete(systemKey);

    const option = this.#fsSelector.querySelector(`option[value="${systemKey}"]`)!;
    option.remove();

    this.#codeMirrorPanels!.removePanel(systemKey);
    this.#fileSystemPanels!.removePanel("fss:" + systemKey);

    if (!isRename) {
      this.#fsSelector.selectedIndex = -1;
    }
  }

  async #doFileSystemExport(): Promise<void> {
    const systemKey = this.#fileSystemSetController!.getSourceFileSystem();
    const fsController: FileSystemController = this.#fileSystemToControllerMap.get(systemKey)!;
    const blob: Blob = await this.#fileSystemSetController!.getExportedFilesZip(fsController.fileMap);
    const url: string = URL.createObjectURL(blob);

    const { promise, resolve } = Promise.withResolvers<void>();
    const form = document.getElementById("exportFileForm") as HTMLFormElement;
    form.onsubmit = event => resolve();

    const downloadLink = document.getElementById("downloadZipLink") as HTMLAnchorElement;
    downloadLink.href = url;

    const dialog = document.getElementById("exportFileDialog") as HTMLDialogElement;
    dialog.showModal();
    await promise;

    URL.revokeObjectURL(url);
    form.onsubmit = null;
    downloadLink.href = "#";
  }

  async #addFileSystemOption(
    systemKey: string,
    fileSystem: FileSystemMap,
    isReadOnly: boolean,
  ): Promise<HTMLOptionElement>
  {
    const option: HTMLOptionElement = document.createElement("option");
    option.value = systemKey;
    option.append(systemKey);

    const fsDisplayElement = new FileSystemElement();
    fsDisplayElement.id = "fss:" + systemKey;
    this.#fileSystemPanels!.rootElement.append(fsDisplayElement);
    const fsController = new FileSystemController(
      systemKey, isReadOnly, fileSystem, this.#codeMirrorPanels!.rootElement
    );
    this.#fileSystemPanels!.addPanel(fsDisplayElement.id, fsController);
    this.#codeMirrorPanels!.addPanel(systemKey, fsController.editorMapView);

    this.#fileSystemToControllerMap.set(systemKey, fsController);
    return option;
  }

  #insertFileSystemOption(option: HTMLOptionElement) {
    const targetFileSystem = option.value;
    let referenceOption: HTMLOptionElement | null = null;
    for (const currentOption of Array.from(this.#fsSelector.options).slice(2)) {
      if (targetFileSystem.localeCompare(currentOption.text) < 0) {
        referenceOption = currentOption;
        break;
      }
    }

    this.#fsSelector.options.add(option, referenceOption);
  }

  #handleClassClick(event: CustomEvent): void {
    const {
      classSpecifier,
      classLineNumber
    } = event.detail as ClassClickDetails;

    const currentFS: FileSystemController = this.#fileSystemToControllerMap.get(this.#fsSelector.value)!;
    currentFS.showFileAndLineNumber(classSpecifier, classLineNumber);
  }
}

const Workbench = new Workbench_Base();
export { Workbench };
