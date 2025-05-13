import { FileMapView } from "./codemirror/views/FileMapView.js";
import { FileSystemController, } from "./file-system/controller.js";
import { TabPanelsView, } from "./tab-panels/tab-panels-view.js";
import { ReferenceSpecFileMap } from "./reference-spec/FileMap.js";
import { SearchDriver } from "./search/Driver.js";
import { FileSystemMap } from "./storage/FileSystemMap.js";
import { OutputController } from "./reports/outputController.js";
import { ReportSelectController } from "./reports/selectController.js";
class Workbench_Base {
    #fsSelector;
    #fileSystems;
    #currentFileMap;
    #refSpecFS;
    #outputController;
    #reportSelectorController;
    #codeMirrorPanels;
    #fileSystemPanels;
    #fileMapView;
    #filesCheckedMap = new WeakMap;
    #lastRunSpan;
    constructor() {
        this.#fsSelector = document.getElementById("workspace-selector");
        this.#currentFileMap = ReferenceSpecFileMap;
        this.#filesCheckedMap.set(ReferenceSpecFileMap, new Set);
        window.onload = () => this.#initialize();
    }
    fileSelected(pathToFile) {
        this.#fileMapView.selectFile(pathToFile);
    }
    fileCheckToggled(pathToFile, isChecked) {
        const fileSet = this.#filesCheckedMap.get(this.#currentFileMap);
        if (isChecked)
            fileSet.add(pathToFile);
        else
            fileSet.delete(pathToFile);
    }
    #initialize() {
        this.#fillFileSystemPanels();
        this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");
        this.#fileMapView = new FileMapView(this.#currentFileMap, "reference-spec-editors");
        this.#codeMirrorPanels.addPanel("reference-spec", this.#fileMapView);
        this.#codeMirrorPanels.activeViewKey = "reference-spec";
        this.#outputController = new OutputController;
        this.#reportSelectorController = new ReportSelectController("report-selector", this.#outputController);
        this.#lastRunSpan = document.getElementById("lastRun");
        this.#attachEvents();
    }
    #fillFileSystemPanels() {
        this.#fileSystemPanels = new TabPanelsView("filesystem-selector");
        this.#refSpecFS = new FileSystemController("filesystem:reference-spec", true, this);
        this.#refSpecFS.setFileMap(ReferenceSpecFileMap);
        this.#fileSystemPanels.addPanel("filesystem:reference-spec", this.#refSpecFS);
        this.#fileSystemPanels.activeViewKey = "filesystem:reference-spec";
        this.#fileSystems = FileSystemMap.getAll();
        for (const [systemKey, fileSystem] of this.#fileSystems) {
        }
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
        this.#fileMapView.updateFileMap();
    }
    #attachEvents() {
        document.getElementById("runSearchesButton").onclick = this.#runSearches.bind(this);
        const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector));
        for (const tab of tabs) {
            tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey);
        }
        this.#fsSelector.onchange = this.#onWorkspaceSelect.bind(this);
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
        if (value === "reference-spec") {
            this.#currentFileMap = ReferenceSpecFileMap;
        }
    }
}
const Workbench = new Workbench_Base();
export { Workbench };
