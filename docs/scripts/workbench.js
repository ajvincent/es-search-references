//#region preamble
import { FileMapView } from "./codemirror/views/FileMapView.js";
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
//#endregion preamble
class Workbench_Base {
    #refSpecFS;
    #outputController;
    #reportSelectorController;
    #fsSelector;
    #fileSystems;
    #fileSystemControlsLeftView;
    #fileUploadsView;
    #currentFileMap;
    #fsToOptionMap = new WeakMap;
    #codeMirrorPanels;
    #fileSystemPanels;
    #referenceFileMapView;
    #filesCheckedMap = new WeakMap;
    #lastRunSpan;
    constructor() {
        this.#fsSelector = document.getElementById("workspace-selector");
        this.#currentFileMap = ReferenceSpecFileMap;
        this.#filesCheckedMap.set(ReferenceSpecFileMap, new Set);
        window.onload = () => this.#initialize();
    }
    fileSelected(controller, pathToFile) {
        this.#referenceFileMapView.selectFile(pathToFile);
    }
    fileCheckToggled(controller, pathToFile, isChecked) {
        const fileSet = this.#filesCheckedMap.get(this.#currentFileMap);
        if (isChecked)
            fileSet.add(pathToFile);
        else
            fileSet.delete(pathToFile);
    }
    async #initialize() {
        this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");
        await this.#fillFileSystemPanels();
        this.#referenceFileMapView = new FileMapView(this.#currentFileMap, "reference-spec-editors");
        this.#codeMirrorPanels.addPanel("reference-spec-filesystem", this.#referenceFileMapView);
        this.#codeMirrorPanels.addPanel("filesystem-controls", new GenericPanelView("filesystem-controls-right"));
        this.#codeMirrorPanels.activeViewKey = "reference-spec-filesystem";
        this.#outputController = new OutputController;
        this.#reportSelectorController = new ReportSelectController("report-selector", this.#outputController);
        this.#lastRunSpan = document.getElementById("lastRun");
        this.#attachEvents();
        this.#fsSelector.value = "reference-spec-filesystem";
    }
    async #fillFileSystemPanels() {
        this.#fileSystemPanels = new TabPanelsView("filesystem-selector");
        this.#refSpecFS = new FileSystemController("reference-spec-filesystem", true, this);
        this.#refSpecFS.setFileMap(ReferenceSpecFileMap);
        this.#fileSystemPanels.addPanel("reference-spec-filesystem", this.#refSpecFS);
        this.#fileSystemPanels.activeViewKey = "reference-spec-filesystem";
        this.#fileSystemControlsLeftView = new GenericPanelView("filesystem-controls-left");
        this.#fileSystemPanels.addPanel("filesystem-controls", this.#fileSystemControlsLeftView);
        this.#fileUploadsView = new FileUploadsView();
        this.#fileSystems = FileSystemMap.getAll();
        const optionPromises = [];
        for (const [systemKey, fileSystem] of this.#fileSystems) {
            optionPromises.push(this.#addFileSystemOption(systemKey, fileSystem));
        }
        const options = await Promise.all(optionPromises);
        options.sort((a, b) => a.text.localeCompare(b.text));
        this.#fsSelector.append(...options);
    }
    async #runSearches(event) {
        event.preventDefault();
        event.stopPropagation();
        this.#outputController.clearResults();
        this.#updateFileMap();
        const driver = new SearchDriver(this.#currentFileMap);
        const fileSet = this.#filesCheckedMap.get(this.#currentFileMap);
        const resultsMap = await driver.run(Array.from(fileSet));
        this.#outputController.addResults(resultsMap);
        this.#reportSelectorController.refreshTree();
        this.#lastRunSpan.replaceChildren((new Date()).toLocaleString());
    }
    #updateFileMap() {
        this.#referenceFileMapView.updateFileMap();
    }
    #attachEvents() {
        document.getElementById("runSearchesButton").onclick = this.#runSearches.bind(this);
        const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector));
        for (const tab of tabs) {
            tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey);
        }
        this.#fsSelector.onchange = this.#onWorkspaceSelect.bind(this);
        this.#fileUploadsView.displayElement.onsubmit = this.#doFileUpload.bind(this);
    }
    #selectOutputReportTab(tabKey, event) {
        event.preventDefault();
        event.stopPropagation();
        this.#outputController?.selectTabKey(tabKey);
    }
    #onWorkspaceSelect(event) {
        event.stopPropagation();
        event.preventDefault();
        const { value } = this.#fsSelector;
        if (value === "filesystem-controls") {
            this.#fileSystemPanels.activeViewKey = "filesystem-controls";
            this.#codeMirrorPanels.activeViewKey = "filesystem-controls";
            return;
        }
        if (value === "reference-spec-filesystem") {
            this.#currentFileMap = ReferenceSpecFileMap;
            this.#fileSystemPanels.activeViewKey = "reference-spec-filesystem";
            this.#codeMirrorPanels.activeViewKey = "";
            return;
        }
        const systemKey = value.replace(/^filesystem:/, "");
        this.#currentFileMap = this.#fileSystems.get(systemKey);
        this.#fileSystemPanels.activeViewKey = value;
        this.#codeMirrorPanels.activeViewKey = "";
    }
    async #doFileUpload(event) {
        event.preventDefault();
        event.stopPropagation();
        const targetFileSystem = this.#fileUploadsView.getSelectedFileSystem();
        const newFileEntries = await this.#fileUploadsView.getFileEntries();
        this.#fileUploadsView.displayElement.reset();
        const fileSystems = this.#fileSystems;
        let fs = fileSystems.get(targetFileSystem);
        if (fs) {
            fs.batchUpdate(() => {
                for (const [pathToFile, contents] of newFileEntries) {
                    fs.set(pathToFile, contents);
                }
            });
        }
        else {
            fs = new FileSystemMap(targetFileSystem, newFileEntries);
            fileSystems.set(targetFileSystem, fs);
            const option = await this.#addFileSystemOption(targetFileSystem, fs);
            let referenceOption = null;
            for (const currentOption of Array.from(this.#fsSelector.options).slice(2)) {
                if (targetFileSystem.localeCompare(currentOption.text) < 0) {
                    referenceOption = currentOption;
                    break;
                }
            }
            this.#fsSelector.options.add(option, referenceOption);
            this.#fsToOptionMap.set(fs, option);
        }
        this.#fsSelector.value = this.#fsToOptionMap.get(fs).value;
    }
    async #addFileSystemOption(systemKey, fileSystem) {
        const option = document.createElement("option");
        option.value = "filesystem:" + systemKey;
        option.append(systemKey);
        const fsDisplayElement = new FileSystemElement();
        fsDisplayElement.id = option.value;
        this.#fileSystemPanels.rootElement.append(fsDisplayElement);
        const fsController = new FileSystemController(option.value, false, this);
        this.#fileSystemPanels.addPanel(option.value, fsController);
        this.#codeMirrorPanels.addPanel(option.value, new FileMapView(fileSystem, option.value));
        fsDisplayElement.connectedPromise.then(() => {
            fsController.setFileMap(fileSystem);
        });
        return option;
    }
}
const Workbench = new Workbench_Base();
export { Workbench };
