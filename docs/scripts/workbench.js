import { FileSystemController, } from "./file-system/controller.js";
import { FileSystemElement } from "./file-system/elements/file-system.js";
import { FileSystemSetController, ValidFileOperations } from "./file-system/setController.js";
import { TabPanelsView, } from "./tab-panels/tab-panels-view.js";
import { OPFSFrontEnd } from "./opfs/client/FrontEnd.js";
import { ProjectDir } from "./opfs/client/ProjectDir.js";
import { FileSystemSelectorView } from "./workbench-views/FileSystemSelector.js";
class Workbench_Base {
    static async build() {
        const frontEnd = await OPFSFrontEnd.build(ProjectDir);
        return new Workbench_Base(frontEnd);
    }
    #frontEnd;
    #outputController;
    #reportSelectorController;
    #displayElement;
    #fsSelectElement;
    #fsSelector;
    #fileSystemToControllerMap = new Map;
    /*
    #fileSystemControlsLeftView?: GenericPanelView;
    */
    #fileSystemSetController;
    #codeMirrorPanels;
    /** A container for the file system trees in the lower left corner. */
    #fileSystemPanels;
    #lastRunSpan;
    constructor(frontEnd) {
        this.#frontEnd = frontEnd;
        this.#displayElement = document.getElementById("workbench");
        this.#fsSelectElement = document.getElementById("workspace-selector");
        this.#fsSelector = new FileSystemSelectorView(document.getElementById("workspace-selector"), uuid => this.#onWorkspaceSelect(uuid), () => this.#onFileSystemControlsSelect());
        if (document.readyState === "complete")
            Promise.resolve().then(() => this.#initialize());
        else
            window.onload = () => this.#initialize();
    }
    async #initialize() {
        this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");
        await this.#fillFileSystemPanels();
        /*
        this.#codeMirrorPanels.addPanel("filesystem-controls", this.#fileSystemSetController!.view);
        this.#codeMirrorPanels.activeViewKey = "reference-spec-filesystem";
    
        this.#outputController = new OutputController;
        this.#reportSelectorController = new ReportSelectController(
          "report-selector", this.#outputController
        );
    
        this.#lastRunSpan = document.getElementById("lastRun")!;
        */
        this.#attachEvents();
    }
    async #fillFileSystemPanels() {
        this.#fileSystemSetController = new FileSystemSetController(this.#frontEnd);
        await this.#fileSystemSetController.ensureReferenceFS();
        this.#fileSystemPanels = new TabPanelsView("filesystem-panels");
        /*
        this.#fileSystemPanels.addPanel("filesystem-controls", this.#fileSystemControlsLeftView!);
        */
        await this.#fsSelector.fillOptions(this.#frontEnd);
    }
    #getCurrentFSController() {
        return this.#fileSystemToControllerMap.get(this.#fsSelectElement.value);
    }
    async #runSearches(event) {
        event.preventDefault();
        event.stopPropagation();
        /*
    
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
        */
    }
    #attachEvents() {
        /*
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
        */
    }
    #selectOutputReportTab(tabKey, event) {
        event.preventDefault();
        event.stopPropagation();
        this.#outputController?.selectTabKey(tabKey);
    }
    async #onWorkspaceSelect(key) {
        const panelKey = "fss:" + key;
        const webFS = await this.#frontEnd.getWebFS(key);
        if (!this.#fileSystemPanels.hasPanel(panelKey)) {
            const fsDisplayElement = new FileSystemElement();
            fsDisplayElement.id = panelKey;
            const fsController = await FileSystemController.build(panelKey, true, fsDisplayElement, this.#codeMirrorPanels.rootElement, webFS);
            this.#fileSystemPanels.addPanel(panelKey, fsController);
            this.#codeMirrorPanels.addPanel(panelKey, fsController.editorMapView);
            this.#fileSystemToControllerMap.set(panelKey, fsController);
        }
        this.#fileSystemPanels.activeViewKey = panelKey;
        this.#codeMirrorPanels.activeViewKey = panelKey;
        /*
        this.#reportSelectorController?.clear();
        this.#outputController?.clearResults();
        */
    }
    #onFileSystemControlsSelect() {
    }
    async #onFileSetControllerSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        switch (this.#fileSystemSetController.selectedOperation) {
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
        this.#fileSystemSetController.reset();
    }
    async #doFileSystemClone() {
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
    async #doFileSystemUpload() {
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
    async #doFileSystemDelete(isRename) {
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
    async #doFileSystemExport() {
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
    #insertFileSystemOption(option) {
        const targetFileSystem = option.value;
        let referenceOption = null;
        for (const currentOption of Array.from(this.#fsSelectElement.options).slice(2)) {
            if (targetFileSystem.localeCompare(currentOption.text) < 0) {
                referenceOption = currentOption;
                break;
            }
        }
        this.#fsSelectElement.options.add(option, referenceOption);
    }
    #handleClassClick(event) {
        const { classSpecifier, classLineNumber } = event.detail;
        const currentFS = this.#fileSystemToControllerMap.get(this.#fsSelectElement.value);
        currentFS.showFileAndLineNumber(classSpecifier, classLineNumber);
    }
}
const Workbench = await Workbench_Base.build();
export { Workbench };
