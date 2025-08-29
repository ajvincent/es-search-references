//#region preamble
import type {
  FileEditorMapView
} from "./codemirror/views/FileEditorMapView.js";

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

import {
  OPFSFrontEnd
} from "./opfs/client/FrontEnd.js";

import {
  ProjectDir
} from "./opfs/client/ProjectDir.js";

import type {
  FileSystemsRecords,
  UUID
} from "./opfs/types/messages.js";

import {
  GenericPanelView
} from "./tab-panels/panelView.js";

import {
  FileSystemSelectorView
} from "./workbench-views/FileSystemSelector.js";
//#endregion preamble

interface ClassClickDetails {
  classSpecifier: string;
  classLineNumber: number;
}

class Workbench_Base {
  static async build(): Promise<Workbench_Base> {
    const frontEnd: OPFSFrontEnd = await OPFSFrontEnd.build(ProjectDir);
    return new Workbench_Base(frontEnd);
  }

  #frontEnd: OPFSFrontEnd;

  #outputController?: OutputController;
  #reportSelectorController?: ReportSelectController;

  readonly #displayElement: HTMLDivElement;

  readonly #fsSelectElement: HTMLSelectElement;
  readonly #fsSelector: FileSystemSelectorView;
  readonly #fileSystemToControllerMap = new Map<string, FileSystemController>;

  /*
  #fileSystemControlsLeftView?: GenericPanelView;
  */
  #referenceFileSystemUUID?: UUID;
  #fileSystemSetController?: FileSystemSetController;

  #codeMirrorPanels?: TabPanelsView<FileEditorMapView>;

  /** A container for the file system trees in the lower left corner. */
  #fileSystemPanels?: TabPanelsView<FileSystemController>;

  #lastRunSpan?: HTMLElement;

  private constructor(
    frontEnd: OPFSFrontEnd
  )
  {
    this.#frontEnd = frontEnd;

    this.#displayElement = document.getElementById("workbench") as HTMLDivElement;
    this.#fsSelectElement = document.getElementById("workspace-selector") as HTMLSelectElement;

    this.#fsSelector = new FileSystemSelectorView(
      document.getElementById("workspace-selector") as HTMLSelectElement,
      uuid => this.#onWorkspaceSelect(uuid),
      () => this.#onFileSystemControlsSelect(),
    );

    if (document.readyState === "complete")
      Promise.resolve().then(() => this.#initialize());
    else
      window.onload = () => this.#initialize();
  }

  async #initialize(): Promise<void> {
    this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");
    await this.#fillFileSystemPanels();

    /*
    this.#codeMirrorPanels.addPanel("filesystem-controls", this.#fileSystemSetController!.view);
    this.#codeMirrorPanels.activeViewKey = "reference-spec-filesystem";
    */

    this.#outputController = new OutputController;
    this.#reportSelectorController = new ReportSelectController(
      "report-selector", this.#outputController
    );

    this.#lastRunSpan = document.getElementById("lastRun")!;
    this.#attachEvents();
  }

  async #fillFileSystemPanels(): Promise<void> {
    this.#fileSystemSetController = new FileSystemSetController(this.#frontEnd);
    await this.#fileSystemSetController.ensureReferenceFS();
    this.#referenceFileSystemUUID = await this.#fileSystemSetController.getReferenceUUID();

    this.#fileSystemPanels = new TabPanelsView("filesystem-panels");
    /*
    this.#fileSystemPanels.addPanel("filesystem-controls", this.#fileSystemControlsLeftView!);
    */

    await this.#fsSelector.fillOptions(this.#frontEnd);
  }

  #getCurrentFSController(): FileSystemController | undefined {
    return this.#fileSystemToControllerMap.get(this.#fsSelectElement.value);
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
    await fsController.updateSelectedFile();
    const driver = new SearchDriver(await fsController.getWebFilesMap());

    const fileSet = fsController.filesCheckedSet;
    const resultsMap: ReadonlyMap<string, ReadonlyMap<string, SearchResults>> = await driver.run(Array.from(fileSet));

    this.#outputController!.addResults(resultsMap);
    const index = await fsController.getWebFilesIndex();
    this.#reportSelectorController!.refreshTree(index);

    this.#lastRunSpan!.replaceChildren((new Date()).toLocaleString());
  }

  #attachEvents(): void {
    document.getElementById("runSearchesButton")!.onclick = this.#runSearches.bind(this);
    const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector)) as HTMLElement[];
    for (const tab of tabs) {
      tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey!);
    }

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

  async #onWorkspaceSelect(key: UUID): Promise<void> {
    const panelKey = "fss:" + key;
    const webFS = await this.#frontEnd.getWebFS(key);
    if (!this.#fileSystemPanels!.hasPanel(panelKey)) {
      const fsDisplayElement = new FileSystemElement();
      fsDisplayElement.id = panelKey;
      const isReadOnly = key === this.#referenceFileSystemUUID;
      const fsController = await FileSystemController.build(
        panelKey, isReadOnly, fsDisplayElement, this.#codeMirrorPanels!.rootElement, webFS
      );

      this.#fileSystemPanels!.addPanel(panelKey, fsController);
      this.#codeMirrorPanels!.addPanel(panelKey, fsController.editorMapView);
      this.#fileSystemToControllerMap.set(panelKey, fsController);
    }

    this.#fileSystemPanels!.activeViewKey = panelKey;
    this.#codeMirrorPanels!.activeViewKey = panelKey;

    this.#reportSelectorController?.clear();
    this.#outputController?.clearResults();
  }

  #onFileSystemControlsSelect(): void {

  }

  //#region file system set manipulation
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
    /*
    const sourceFileSystem: string = this.#fileSystemSetController!.getSourceFileSystem();
    const targetFileSystem: string = this.#fileSystemSetController!.getTargetFileSystem();

    const sourceFS: FileSystemMap = this.#fileSystemToControllerMap.get(sourceFileSystem)!.fileMap;
    const targetFS: FileSystemMap = sourceFS.clone(targetFileSystem);

    const option = await this.#addFileSystemOption(targetFileSystem, targetFS, false);
    this.#insertFileSystemOption(option);

    this.#fsSelector.value = targetFileSystem;
    */
  }

  async #doFileSystemUpload(): Promise<void> {
    /*
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
    */
  }

  async #doFileSystemDelete(isRename: boolean): Promise<void> {
    // TODO: provide API to delete all file systems and all local storage we use!
    // use case: hey, the reference spec filesystem is out of date.

    /*
    const systemKey = this.#fileSystemSetController!.getSourceFileSystem();
    if (!isRename) {
      const ok = window.confirm(`Are you sure you want to delete the "${systemKey}" file system?  This operation is irreversible!`);
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
    */
  }

  async #doFileSystemExport(): Promise<void> {
    /*
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
    */
  }

  /*
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
      systemKey, isReadOnly, fsDisplayElement, fileSystem, this.#codeMirrorPanels!.rootElement
    );
    this.#fileSystemPanels!.addPanel(fsDisplayElement.id, fsController);
    this.#codeMirrorPanels!.addPanel(systemKey, fsController.editorMapView);

    this.#fileSystemToControllerMap.set(systemKey, fsController);
    return option;
  }
  */

  #insertFileSystemOption(option: HTMLOptionElement) {
    const targetFileSystem = option.value;
    let referenceOption: HTMLOptionElement | null = null;
    for (const currentOption of Array.from(this.#fsSelectElement.options).slice(2)) {
      if (targetFileSystem.localeCompare(currentOption.text) < 0) {
        referenceOption = currentOption;
        break;
      }
    }

    this.#fsSelectElement.options.add(option, referenceOption);
  }
  //#endregion file system set manipulation

  #handleClassClick(event: CustomEvent): void {
    const {
      classSpecifier,
      classLineNumber
    } = event.detail as ClassClickDetails;

    const currentFS: FileSystemController = this.#fileSystemToControllerMap.get(this.#fsSelectElement.value)!;
    currentFS.showFileAndLineNumber(classSpecifier, classLineNumber);
  }
}

const Workbench = await Workbench_Base.build();
export { Workbench };
