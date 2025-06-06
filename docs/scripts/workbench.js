//#region preamble
import { FileSystemController, } from "./file-system/controller.js";
import { FileSystemElement } from "./file-system/elements/file-system.js";
import { FileSystemSetController, ValidFileOperations } from "./file-system/setController.js";
import { TabPanelsView, } from "./tab-panels/tab-panels-view.js";
import { ReferenceSpecFileMap } from "./reference-spec/FileMap.js";
import { SearchDriver } from "./search/Driver.js";
import { FileSystemMap } from "./storage/FileSystemMap.js";
import { OutputController } from "./reports/outputController.js";
import { ReportSelectController } from "./reports/selectController.js";
import { GenericPanelView } from "./tab-panels/panelView.js";
class Workbench_Base {
    #outputController;
    #reportSelectorController;
    #displayElement;
    #fsSelector;
    #fileSystemToControllerMap = new Map;
    #fileSystemControlsLeftView;
    #fileSystemSetController;
    #codeMirrorPanels;
    #fileSystemPanels;
    #lastRunSpan;
    constructor() {
        this.#displayElement = document.getElementById("workbench");
        this.#fsSelector = document.getElementById("workspace-selector");
        window.onload = () => this.#initialize();
    }
    async #initialize() {
        this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");
        await this.#fillFileSystemPanels();
        this.#codeMirrorPanels.addPanel("filesystem-controls", this.#fileSystemSetController.view);
        this.#codeMirrorPanels.activeViewKey = "reference-spec-filesystem";
        this.#outputController = new OutputController;
        this.#reportSelectorController = new ReportSelectController("report-selector", this.#outputController);
        this.#lastRunSpan = document.getElementById("lastRun");
        this.#attachEvents();
    }
    async #fillFileSystemPanels() {
        this.#fileSystemPanels = new TabPanelsView("filesystem-selector");
        const refSpecOption = await this.#addFileSystemOption("reference-spec-filesystem", ReferenceSpecFileMap, false, true);
        this.#fileSystemControlsLeftView = new GenericPanelView("filesystem-controls-left");
        this.#fileSystemPanels.addPanel("filesystem-controls", this.#fileSystemControlsLeftView);
        this.#fileSystemSetController = new FileSystemSetController();
        const fileSystems = FileSystemMap.getAll();
        const optionPromises = [];
        for (const [systemKey, fileSystem] of fileSystems) {
            optionPromises.push(this.#addFileSystemOption(systemKey, fileSystem, true, false));
        }
        const options = await Promise.all(optionPromises);
        this.#fsSelector.append(refSpecOption, ...options);
        this.#fsSelector.value = "reference-spec-filesystem";
        this.#onWorkspaceSelect();
    }
    #getCurrentFSController() {
        return this.#fileSystemToControllerMap.get(this.#fsSelector.value);
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
        fsController.updateFileMap();
        const driver = new SearchDriver(fsController.fileMap);
        const fileSet = fsController.filesCheckedSet;
        const resultsMap = await driver.run(Array.from(fileSet));
        this.#outputController.addResults(resultsMap);
        this.#reportSelectorController.refreshTree();
        this.#lastRunSpan.replaceChildren((new Date()).toLocaleString());
    }
    #attachEvents() {
        document.getElementById("runSearchesButton").onclick = this.#runSearches.bind(this);
        const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector));
        for (const tab of tabs) {
            tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey);
        }
        this.#fsSelector.onchange = this.#onWorkspaceSelect.bind(this);
        this.#fileSystemSetController.form.onsubmit = this.#onFileSetControllerSubmit.bind(this);
        this.#displayElement.addEventListener("classClick", (event) => this.#handleClassClick(event), { capture: true, passive: true });
    }
    #selectOutputReportTab(tabKey, event) {
        event.preventDefault();
        event.stopPropagation();
        this.#outputController?.selectTabKey(tabKey);
    }
    #onWorkspaceSelect(event) {
        event?.stopPropagation();
        event?.preventDefault();
        const { value } = this.#fsSelector;
        this.#fileSystemPanels.activeViewKey = "fss:" + value;
        this.#codeMirrorPanels.activeViewKey = value;
        this.#reportSelectorController?.clear();
        this.#outputController?.clearResults();
    }
    #onFileSetControllerSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        switch (this.#fileSystemSetController.selectedOperation) {
            case ValidFileOperations.upload:
                return this.#doFileUpload();
        }
        return Promise.reject(new Error("unsupported operation"));
    }
    async #doFileUpload() {
        const targetFileSystem = this.#fileSystemSetController.getSelectedFileSystem();
        const newFileEntries = await this.#fileSystemSetController.getFileEntries();
        this.#fileSystemSetController.form.reset();
        let fs = this.#fileSystemToControllerMap.get(targetFileSystem)?.fileMap;
        if (fs) {
            fs.batchUpdate(() => {
                for (const [pathToFile, contents] of newFileEntries) {
                    fs.set(pathToFile, contents);
                }
            });
        }
        else {
            if (newFileEntries.every(pathAndContents => pathAndContents[0] !== "es-search-references/guest")) {
                const guestFile = this.#fileSystemToControllerMap.get("reference-spec-filesystem")?.fileMap.get("es-search-references/guest");
                if (!guestFile) {
                    throw new Error("no guest file?");
                }
                newFileEntries.push(["es-search-references/guest", guestFile]);
            }
            const fs = new FileSystemMap(targetFileSystem, newFileEntries);
            const option = await this.#addFileSystemOption(targetFileSystem, fs, true, false);
            let referenceOption = null;
            for (const currentOption of Array.from(this.#fsSelector.options).slice(2)) {
                if (targetFileSystem.localeCompare(currentOption.text) < 0) {
                    referenceOption = currentOption;
                    break;
                }
            }
            this.#fsSelector.options.add(option, referenceOption);
        }
        this.#fsSelector.value = targetFileSystem;
    }
    async #addFileSystemOption(systemKey, fileSystem, useFSPrefix, isReadOnly) {
        const option = document.createElement("option");
        const key = useFSPrefix ? "filesystem:" + systemKey : systemKey;
        option.value = key;
        option.append(systemKey);
        const fsDisplayElement = new FileSystemElement();
        fsDisplayElement.id = "fss:" + key;
        this.#fileSystemPanels.rootElement.append(fsDisplayElement);
        const fsController = new FileSystemController(key, isReadOnly, fileSystem, this.#codeMirrorPanels.rootElement);
        this.#fileSystemPanels.addPanel(fsDisplayElement.id, fsController);
        this.#codeMirrorPanels.addPanel(key, fsController.editorMapView);
        this.#fileSystemToControllerMap.set(key, fsController);
        return option;
    }
    #handleClassClick(event) {
        const { classSpecifier, classLineNumber } = event.detail;
        const currentFS = this.#fileSystemToControllerMap.get(this.#fsSelector.value);
        currentFS.showFileAndLineNumber(classSpecifier, classLineNumber);
    }
}
const Workbench = new Workbench_Base();
export { Workbench };
