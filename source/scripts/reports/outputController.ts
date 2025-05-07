import {
  dagre
} from "../../lib/packages/dagre-imports.js";

import {
  DefaultMap
} from "../search/DefaultMap.js";

import type {
  SearchResults
} from "../search/Results.js";

import {
  BaseView,
  TabPanelsView
} from "../tab-panels/tab-panels-view.js";

import {
  createLayoutGraph
} from "./dagreLayout.js";

import {
  createRenderGraph
} from "./dagreRender.js";

import {
  SVGGraphView
} from "./views/svg-graph.js";

export class OutputController {
  public static readonly tabsSelector = "#output-tabbar > label";

  static #createPreformattedView(contents: string): BaseView {
    const pre = document.createElement("pre");
    pre.append(contents);
    return { displayElement: pre };
  }

  readonly #selected = {
    pathToFile: "",
    searchKey: "",
    tabKey: ""
  };
  readonly #reportPanels = new TabPanelsView("report-panels");

  readonly #filePathsAndSearchKeys: DefaultMap<string, Set<string>> = new DefaultMap(() => new Set);
  readonly filePathsAndSearchKeys: ReadonlyMap<string, ReadonlySet<string>> = this.#filePathsAndSearchKeys;

  readonly #tabKeys = new Set<string>;
  readonly tabKeys: ReadonlySet<string> = this.#tabKeys;

  clearResults(): void {
    this.selectTabKey("");
    this.#reportPanels.clearPanels();
    this.#selected.pathToFile = "";
    this.#selected.searchKey = "";
    this.#selected.tabKey = "";
    this.#filePathsAndSearchKeys.clear();
    this.#tabKeys.clear();
  }

  selectFileAndSearchKey(
    pathToFile: string,
    searchKey: string
  ): void
  {
    this.#selected.pathToFile = pathToFile;
    this.#selected.searchKey = searchKey;
    this.#updateSelectedPanel();
  }

  selectTabKey(tabKey: string): void {
    if (this.#selected.tabKey) {
      this.#setTabSelected(this.#selected.tabKey, false);
    }
    this.#selected.tabKey = tabKey;
    this.#setTabSelected(this.#selected.tabKey, true);
    this.#updateSelectedPanel();
  }

  #updateSelectedPanel() {
    const hash = JSON.stringify(this.#selected);
    this.#reportPanels.activeViewKey = hash;
  }

  #setTabSelected(tabKey: string, isSelected: boolean): void {
    const tab = document.querySelector(`${OutputController.tabsSelector}[data-tabkey="${tabKey}"]`);
    if (!tab)
      return;
    if (isSelected) {
      tab.classList.add("selected");
    } else {
      tab.classList.remove("selected");
    }
  }

  addResults(
    resultsMap: ReadonlyMap<string, ReadonlyMap<string, SearchResults>>
  ): void
  {
    for (const [pathToFile, innerMap] of resultsMap) {
      for (const [searchKey, results] of innerMap) {
        this.#filePathsAndSearchKeys.getDefault(pathToFile).add(searchKey);

        this.#addRawGraphPanel(pathToFile, searchKey, results);
        this.#addLogPanel(pathToFile, searchKey, results);
        this.#addLayoutPanel(pathToFile, searchKey, results);
        this.#addGraphPanel(pathToFile, searchKey, results);

        this.selectTabKey("svg-graph");
      }
    }
  }

  #addRawGraphPanel(
    pathToFile: string,
    searchKey: string,
    results: SearchResults
  ): void
  {
    const serializedGraph = results.graph ? JSON.stringify(dagre.graphlib.json.write(results.graph), null, 2) : "(null)";
    const view: BaseView = OutputController.#createPreformattedView(serializedGraph);
    this.#addPanel(pathToFile, searchKey, "searchResults", view);
  }

  #addLogPanel(
    pathToFile: string,
    searchKey: string,
    results: SearchResults
  ): void
  {
    const view: BaseView = OutputController.#createPreformattedView(
      results.logs.join("\n")
    );

    this.#addPanel(pathToFile, searchKey, "searchLog", view);
  }

  #addLayoutPanel(
    pathToFile: string,
    searchKey: string,
    results: SearchResults
  ): void
  {
    let view: BaseView;
    if (results.graph) {
      results.layoutGraph = createLayoutGraph(results.graph);
      const serializedGraph = JSON.stringify(results.graph, null, 2);
      view = OutputController.#createPreformattedView(serializedGraph);
    } else {
      view = OutputController.#createPreformattedView("(null)");
    }

    this.#addPanel(pathToFile, searchKey, "dagre-layout", view);
  }

  #addGraphPanel(
    pathToFile: string,
    searchKey: string,
    results: SearchResults
  ): void
  {
    if (!results.layoutGraph) {
      const view = OutputController.#createPreformattedView("(null)");
      this.#addPanel(pathToFile, searchKey, "svg-graph", view);
      return;
    }

    const view = new SVGGraphView();
    this.#addPanel(pathToFile, searchKey, "svg-graph", view);
    view.activatedPromise.then(() => createRenderGraph(results.layoutGraph!, view));
  }

  #addPanel(
    pathToFile: string,
    searchKey: string,
    tabKey: string,
    view: BaseView
  ): void
  {
    this.#tabKeys.add(tabKey);

    const hash = JSON.stringify({pathToFile, searchKey, tabKey});
    this.#reportPanels!.addPanel(hash, view);

    if (!this.#selected.pathToFile) {
      this.#selected.pathToFile = pathToFile;
      this.#selected.searchKey = searchKey;
      this.selectTabKey(tabKey);
    }
  }
}
