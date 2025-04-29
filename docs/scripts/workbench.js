import { FileMapView } from "./codemirror/views/FileMapView.js";
import { FileSystemController, } from "./file-system/controller.js";
import { TabPanelsView, } from "./tab-panels/tab-panels-view.js";
import { ReferenceSpecFileMap } from "./reference-spec/FileMap.js";
import { SearchDriver } from "./search/Driver.js";
import { OutputController } from "./reports/outputController.js";
import { ReportSelectController } from "./reports/selectController.js";
class Workbench_Base {
    /*
    readonly #fsSelector: HTMLSelectElement;
    */
    #fileMap;
    #refSpecFS;
    #outputController;
    #reportSelectorController;
    #codeMirrorPanels;
    #fileMapView;
    #filesCheckedMap = new WeakMap;
    #lastRunSpan;
    constructor() {
        /*
        this.#fsSelector = document.getElementById("workspace-selector") as HTMLSelectElement;
        */
        this.#fileMap = ReferenceSpecFileMap;
        this.#filesCheckedMap.set(ReferenceSpecFileMap, new Set);
        window.onload = () => this.#initialize();
    }
    fileSelected(pathToFile) {
        this.#fileMapView.selectFile(pathToFile);
    }
    fileCheckToggled(pathToFile, isChecked) {
        const fileSet = this.#filesCheckedMap.get(this.#fileMap);
        if (isChecked)
            fileSet.add(pathToFile);
        else
            fileSet.delete(pathToFile);
    }
    #initialize() {
        this.#refSpecFS = new FileSystemController("filesystem:reference-spec", true, this);
        this.#refSpecFS.setFileMap(ReferenceSpecFileMap);
        this.#codeMirrorPanels = new TabPanelsView("codemirror-panels");
        this.#fileMapView = new FileMapView(this.#fileMap, "reference-spec-editors");
        this.#codeMirrorPanels.addPanel("reference-spec", this.#fileMapView);
        this.#codeMirrorPanels.activeViewKey = "reference-spec";
        this.#outputController = new OutputController;
        this.#reportSelectorController = new ReportSelectController("report-selector", this.#outputController);
        this.#lastRunSpan = document.getElementById("lastRun");
        this.#attachEvents();
    }
    #attachEvents() {
        document.getElementById("runSearchesButton").onclick = this.#runSearches.bind(this);
        const tabs = Array.from(document.querySelectorAll(OutputController.tabsSelector));
        for (const tab of tabs) {
            tab.onclick = this.#selectOutputReportTab.bind(this, tab.dataset.tabkey);
        }
        /*
        document.getElementById("testButton")?.onclick = () => this.#doTestAction();
        */
    }
    async #runSearches(event) {
        event.preventDefault();
        event.stopPropagation();
        this.#outputController.clearResults();
        this.#updateFileMap();
        const driver = new SearchDriver(this.#fileMap);
        const fileSet = this.#filesCheckedMap.get(this.#fileMap);
        const resultsMap = await driver.run(Array.from(fileSet));
        this.#outputController.addResults(resultsMap);
        this.#reportSelectorController.refreshTree();
        this.#lastRunSpan.replaceChildren((new Date()).toLocaleString());
    }
    #updateFileMap() {
        this.#fileMapView.updateFileMap();
    }
    #selectOutputReportTab(tabKey, event) {
        event.preventDefault();
        event.stopPropagation();
        this.#outputController?.selectTabKey(tabKey);
    }
    #doTestAction() {
    }
}
const Workbench = new Workbench_Base();
export { Workbench };
