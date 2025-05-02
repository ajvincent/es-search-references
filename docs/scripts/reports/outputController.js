var _a;
import { dagre } from "../../lib/packages/dagre-imports.js";
import { DefaultMap } from "../search/DefaultMap.js";
import { TabPanelsView } from "../tab-panels/tab-panels-view.js";
import { createLayoutGraph } from "./dagreLayout.js";
import { createRenderGraph } from "./dagreRender.js";
import { SVGGraphView } from "./views/svg-graph.js";
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
                this.#addGraphPanel(pathToFile, searchKey, results);
            }
        }
    }
    #addRawGraphPanel(pathToFile, searchKey, results) {
        const serializedGraph = results.graph ? JSON.stringify(dagre.graphlib.json.write(results.graph), null, 2) : "(null)";
        const view = _a.#createPreformattedView(serializedGraph);
        this.#addPanel(pathToFile, searchKey, "searchResults", view);
    }
    #addLogPanel(pathToFile, searchKey, results) {
        const view = _a.#createPreformattedView(results.logs.join("\n"));
        this.#addPanel(pathToFile, searchKey, "searchLog", view);
    }
    #addLayoutPanel(pathToFile, searchKey, results) {
        let view;
        if (results.graph) {
            results.layoutGraph = createLayoutGraph(results.graph);
            const serializedGraph = JSON.stringify(results.graph, null, 2);
            view = _a.#createPreformattedView(serializedGraph);
        }
        else {
            view = _a.#createPreformattedView("(null)");
        }
        this.#addPanel(pathToFile, searchKey, "dagre-layout", view);
    }
    #addGraphPanel(pathToFile, searchKey, results) {
        let view;
        if (results.layoutGraph) {
            const svgView = new SVGGraphView();
            createRenderGraph(results.layoutGraph, svgView);
            view = svgView;
        }
        else {
            view = _a.#createPreformattedView("(null)");
        }
        this.#addPanel(pathToFile, searchKey, "svg-graph", view);
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
