import { FileSystemController, } from "./file-system/controller.js";
import { FileSystemElement } from "./file-system/elements/file-system.js";
import { FileUploadsView } from "./file-system/views/uploads.js";
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
    #fileUploadsView;
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
        this.#codeMirrorPanels.addPanel("filesystem-controls", new GenericPanelView("filesystem-controls-right"));
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
        this.#fileUploadsView = new FileUploadsView();
        const fileSystems = FileSystemMap.getAll();
        const optionPromises = [];
        for (const [systemKey, fileSystem] of fileSystems) {
            optionPromises.push(this.#addFileSystemOption(systemKey, fileSystem, true, false));
        }
        const options = await Promise.all(optionPromises);
        options.sort((a, b) => a.text.localeCompare(b.text));
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
        this.#fileUploadsView.displayElement.onsubmit = this.#doFileUpload.bind(this);
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
    async #doFileUpload(event) {
        event.preventDefault();
        event.stopPropagation();
        const targetFileSystem = this.#fileUploadsView.getSelectedFileSystem();
        const newFileEntries = await this.#fileUploadsView.getFileEntries();
        this.#fileUploadsView.displayElement.reset();
        let fs = this.#fileSystemToControllerMap.get(targetFileSystem)?.fileMap;
        if (fs) {
            fs.batchUpdate(() => {
                for (const [pathToFile, contents] of newFileEntries) {
                    fs.set(pathToFile, contents);
                }
            });
        }
        else {
            const fs = new FileSystemMap(targetFileSystem, newFileEntries);
            if (!fs.has("es-search-references/guest")) {
                const guestFile = this.#fileSystemToControllerMap.get("reference-spec-filesystem")?.fileMap.get("es-search-references/guest");
                if (!guestFile) {
                    throw new Error("no guest file?");
                }
                fs.set("es-search-references/guest", guestFile);
            }
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
        option.value = useFSPrefix ? "filesystem:" + systemKey : systemKey;
        option.append(systemKey);
        const fsDisplayElement = new FileSystemElement();
        fsDisplayElement.id = "fss:" + option.value;
        this.#fileSystemPanels.rootElement.append(fsDisplayElement);
        const fsController = new FileSystemController(option.value, isReadOnly, fileSystem, this.#codeMirrorPanels.rootElement);
        this.#fileSystemPanels.addPanel(fsDisplayElement.id, fsController);
        this.#codeMirrorPanels.addPanel(option.value, fsController.editorMapView);
        this.#fileSystemToControllerMap.set(option.value, fsController);
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
