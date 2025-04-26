import {
  graphlib
} from "../dagre-imports.js";

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

export class OutputController {
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
  readonly #outputLogsView = new TabPanelsView("output-logs");

  readonly #filePathsAndSearchKeys: DefaultMap<string, Set<string>> = new DefaultMap(() => new Set);
  readonly filePathsAndSearchKeys: ReadonlyMap<string, ReadonlySet<string>> = this.#filePathsAndSearchKeys;

  readonly #tabKeys = new Set<string>;
  readonly tabKeys: ReadonlySet<string> = this.#tabKeys;

  clearResults(): void {
    this.#outputLogsView.clearPanels();
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
    this.#selected.tabKey = tabKey;
    this.#updateSelectedPanel();
  }

  #updateSelectedPanel() {
    const hash = JSON.stringify(this.#selected);
    this.#outputLogsView.activeViewKey = hash;
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
      }
    }
  }

  #addRawGraphPanel(
    pathToFile: string,
    searchKey: string,
    result: SearchResults
  ): void
  {
    const serializedGraph = result.graph ? JSON.stringify(graphlib.json.write(result.graph), null, 2) : "(null)";
    const view = OutputController.#createPreformattedView(serializedGraph);
    this.#addPanel(pathToFile, searchKey, "searchResults", view);
  }

  #addLogPanel(
    pathToFile: string,
    searchKey: string,
    result: SearchResults
  ): void
  {
    const view = OutputController.#createPreformattedView(
      result.logs.join("\n")
    );

    this.#addPanel(pathToFile, searchKey, "searchLog", view);
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
    this.#outputLogsView!.addPanel(hash, view);

    if (!this.#selected.pathToFile) {
      this.#selected.pathToFile = pathToFile;
      this.#selected.searchKey = searchKey;
      this.selectTabKey(tabKey);
    }
  }
}
