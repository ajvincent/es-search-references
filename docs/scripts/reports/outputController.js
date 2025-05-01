var _a;
import { dagre } from "../../lib/packages/dagre-imports.js";
import { DefaultMap } from "../search/DefaultMap.js";
import { TabPanelsView } from "../tab-panels/tab-panels-view.js";
import { createLayoutGraph } from "./dagreLayout.js";
export class OutputController {
    static tabsSelector = "#output-tabbar > label";
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
        this.selectTabKey("");
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
        if (this.#selected.tabKey) {
            this.#setTabSelected(this.#selected.tabKey, false);
        }
        this.#selected.tabKey = tabKey;
        this.#setTabSelected(this.#selected.tabKey, true);
        this.#updateSelectedPanel();
    }
    #updateSelectedPanel() {
        const hash = JSON.stringify(this.#selected);
        this.#outputLogsView.activeViewKey = hash;
    }
    #setTabSelected(tabKey, isSelected) {
        const tab = document.querySelector(`${_a.tabsSelector}[data-tabkey="${tabKey}"]`);
        if (!tab)
            return;
        if (isSelected) {
            tab.classList.add("selected");
        }
        else {
            tab.classList.remove("selected");
        }
    }
    addResults(resultsMap) {
        for (const [pathToFile, innerMap] of resultsMap) {
            for (const [searchKey, results] of innerMap) {
                this.#filePathsAndSearchKeys.getDefault(pathToFile).add(searchKey);
                this.#addRawGraphPanel(pathToFile, searchKey, results);
                this.#addLogPanel(pathToFile, searchKey, results);
                this.#addLayoutPanel(pathToFile, searchKey, results);
            }
        }
    }
    #addRawGraphPanel(pathToFile, searchKey, result) {
        const serializedGraph = result.graph ? JSON.stringify(dagre.graphlib.json.write(result.graph), null, 2) : "(null)";
        const view = _a.#createPreformattedView(serializedGraph);
        this.#addPanel(pathToFile, searchKey, "searchResults", view);
    }
    #addLogPanel(pathToFile, searchKey, result) {
        const view = _a.#createPreformattedView(result.logs.join("\n"));
        this.#addPanel(pathToFile, searchKey, "searchLog", view);
    }
    #addLayoutPanel(pathToFile, searchKey, result) {
        let view;
        if (result.graph) {
            const graph = createLayoutGraph(result.graph);
            const serializedGraph = JSON.stringify(graph, null, 2);
            view = _a.#createPreformattedView(serializedGraph);
        }
        else {
            view = _a.#createPreformattedView("(null)");
        }
        this.#addPanel(pathToFile, searchKey, "dagre-layout", view);
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
