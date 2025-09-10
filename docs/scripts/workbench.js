import { FileSystemController, } from "./file-system/controller.js";
import { FileSystemElement } from "./file-system/elements/file-system.js";
import { FileSystemSetController, ValidFileOperations } from "./file-system/setController.js";
import { TabPanelsView, } from "./tab-panels/tab-panels-view.js";
import { SearchDriver } from "./search/Driver.js";
import { OutputController } from "./reports/outputController.js";
import { ReportSelectController } from "./reports/selectController.js";
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
    #fsSelector;
    #fileSystemToControllerMap = new Map;
    #referenceFileSystemUUID;
    #fileSystemSetController;
    #codeMirrorPanels;
    /** A container for the file system trees in the lower left corner. */
    #fileSystemPanels;
    #lastRunSpan;
    constructor(frontEnd) {
        this.#frontEnd = frontEnd;
        this.#displayElement = document.getElementById("workbench");
        this.#fsSelector = new FileSystemSelectorView(document.getElementById("workspace-selector"), uuid => this.#onWorkspaceSelect(uuid), () => this.#onFileSystemControlsSelect());
        if (document.readyState === "complete")
            Promise.resolve().then(() => this.#initialize());
        else
            window.onload = () => this.#initialize();
    }
    async #initialize() {
        this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");
        await this.#fillFileSystemPanels();
        this.#codeMirrorPanels.addPanel("filesystem-controls", this.#fileSystemSetController.view);
        this.#codeMirrorPanels.activeViewKey = this.#referenceFileSystemUUID;
        this.#outputController = new OutputController;
        this.#reportSelectorController = new ReportSelectController("report-selector", this.#outputController);
        this.#lastRunSpan = document.getElementById("lastRun");
        this.#attachEvents();
        this.#fsSelector.selectOption(this.#referenceFileSystemUUID);
    }
    async #fillFileSystemPanels() {
        this.#fileSystemSetController = new FileSystemSetController(this.#frontEnd, this.#fsSelector);
        await this.#fileSystemSetController.ensureReferenceFS();
        this.#referenceFileSystemUUID = await this.#fileSystemSetController.getReferenceUUID();
        this.#fileSystemPanels = new TabPanelsView("filesystem-panels");
        await this.#fsSelector.fillOptions(this.#frontEnd);
    }
    #getCurrentFSController() {
        return this.#fileSystemToControllerMap.get(this.#fsSelector.currentValue);
    }
    async #runSearches(event) {
        event.preventDefault();
        event.stopPropagation();
        this.#reportSelectorController.clear();
        this.#outputController.clearResults();
        const fsController = this.#getCurrentFSController();
        if (!fsController) {
            return;
        }
        await fsController.updateSelectedFile();
        const driver = new SearchDriver(await fsController.getWebFilesMap());
        const fileSet = fsController.filesCheckedSet;
        const resultsMap = await driver.run(Array.from(fileSet));
        this.#outputController.addResults(resultsMap);
        const index = await fsController.getWebFilesIndex();
        this.#reportSelectorController.refreshTree(index);
        this.#lastRunSpan.replaceChildren((new Date()).toLocaleString());
    }
    #attachEvents() {
        document.getElementById("runSearchesButton").onclick = this.#runSearches.bind(this);
        const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector));
        for (const tab of tabs) {
            tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey);
        }
        this.#fileSystemSetController.form.onsubmit = this.#onFileSetControllerSubmit.bind(this);
        this.#displayElement.addEventListener("classClick", (event) => this.#handleClassClick(event), { capture: true, passive: true });
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
            const isReadOnly = key === this.#referenceFileSystemUUID;
            const fsController = await FileSystemController.build(panelKey, isReadOnly, fsDisplayElement, this.#codeMirrorPanels.rootElement, webFS);
            this.#fileSystemPanels.addPanel(panelKey, fsController);
            this.#codeMirrorPanels.addPanel(panelKey, fsController.editorMapView);
            this.#fileSystemToControllerMap.set(panelKey, fsController);
        }
        this.#fileSystemPanels.activeViewKey = panelKey;
        this.#codeMirrorPanels.activeViewKey = panelKey;
        this.#reportSelectorController?.clear();
        this.#outputController?.clearResults();
    }
    #onFileSystemControlsSelect() {
        this.#fileSystemPanels.activeViewKey = "";
        this.#codeMirrorPanels.activeViewKey = "filesystem-controls";
        this.#reportSelectorController.clear();
        this.#outputController.clearResults();
    }
    //#region file system set manipulation
    async #onFileSetControllerSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        switch (this.#fileSystemSetController.selectedOperation) {
            case ValidFileOperations.clone: {
                await this.#fileSystemSetController.doFileSystemClone();
                break;
            }
            case ValidFileOperations.rename: {
                await this.#fileSystemSetController.doFileSystemRename();
                break;
            }
            case ValidFileOperations.export: {
                await this.#doFileSystemExport();
                break;
            }
            case ValidFileOperations.upload: {
                await this.#fileSystemSetController.doFileSystemUpload();
                break;
            }
            /*
            case ValidFileOperations.delete: {
              await this.#doFileSystemDelete(false);
              break;
            }
            */
            default:
                return Promise.reject(new Error("unsupported operation"));
        }
        this.#fileSystemSetController.reset();
    }
    async #doFileSystemDelete(isRename) {
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
    async #doFileSystemExport() {
        const blob = await this.#fileSystemSetController.getExportedFilesZip();
        const url = URL.createObjectURL(blob);
        const { promise, resolve } = Promise.withResolvers();
        const form = document.getElementById("exportFileForm");
        form.onsubmit = event => resolve();
        const downloadLink = document.getElementById("downloadZipLink");
        downloadLink.href = url;
        const dialog = document.getElementById("exportFileDialog");
        dialog.showModal();
        await promise;
        URL.revokeObjectURL(url);
        form.onsubmit = null;
        downloadLink.href = "#";
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
    /*
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
    */
    //#endregion file system set manipulation
    #handleClassClick(event) {
        const { classSpecifier, classLineNumber } = event.detail;
        this.#getCurrentFSController().showFileAndLineNumber(classSpecifier, classLineNumber);
    }
}
const Workbench = await Workbench_Base.build();
export { Workbench };
