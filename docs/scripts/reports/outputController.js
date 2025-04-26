var _a;
import { graphlib } from "../dagre-imports.js";
import { DefaultMap } from "../search/DefaultMap.js";
import { TabPanelsView } from "../tab-panels/tab-panels-view.js";
export class OutputController {
    static #createPreformattedView(contents) {
        const pre = document.createElement("pre");
        pre.append(contents);
        return { displayElement: pre };
    }
    #selected = {
        pathToFile: "",
        searchKey: "",
        tabKey: ""
    };
    #outputLogsView = new TabPanelsView("output-logs");
    #filePathsAndSearchKeys = new DefaultMap(() => new Set);
    filePathsAndSearchKeys = this.#filePathsAndSearchKeys;
    #tabKeys = new Set;
    tabKeys = this.#tabKeys;
    clearResults() {
        this.#outputLogsView.clearPanels();
        this.#selected.pathToFile = "";
        this.#selected.searchKey = "";
        this.#selected.tabKey = "";
        this.#filePathsAndSearchKeys.clear();
        this.#tabKeys.clear();
    }
    selectFileAndSearchKey(pathToFile, searchKey) {
        this.#selected.pathToFile = pathToFile;
        this.#selected.searchKey = searchKey;
        this.#updateSelectedPanel();
    }
    selectTabKey(tabKey) {
        this.#selected.tabKey = tabKey;
        this.#updateSelectedPanel();
    }
    #updateSelectedPanel() {
        const hash = JSON.stringify(this.#selected);
        this.#outputLogsView.activeViewKey = hash;
    }
    addResults(resultsMap) {
        for (const [pathToFile, innerMap] of resultsMap) {
            for (const [searchKey, results] of innerMap) {
                this.#filePathsAndSearchKeys.getDefault(pathToFile).add(searchKey);
                this.#addRawGraphPanel(pathToFile, searchKey, results);
                this.#addLogPanel(pathToFile, searchKey, results);
            }
        }
    }
    #addRawGraphPanel(pathToFile, searchKey, result) {
        const serializedGraph = result.graph ? JSON.stringify(graphlib.json.write(result.graph), null, 2) : "(null)";
        const view = _a.#createPreformattedView(serializedGraph);
        this.#addPanel(pathToFile, searchKey, "searchResults", view);
    }
    #addLogPanel(pathToFile, searchKey, result) {
        const view = _a.#createPreformattedView(result.logs.join("\n"));
        this.#addPanel(pathToFile, searchKey, "searchLog", view);
    }
    #addPanel(pathToFile, searchKey, tabKey, view) {
        this.#tabKeys.add(tabKey);
        const hash = JSON.stringify({ pathToFile, searchKey, tabKey });
        this.#outputLogsView.addPanel(hash, view);
        if (!this.#selected.pathToFile) {
            this.#selected.pathToFile = pathToFile;
            this.#selected.searchKey = searchKey;
            this.selectTabKey(tabKey);
        }
    }
}
_a = OutputController;
