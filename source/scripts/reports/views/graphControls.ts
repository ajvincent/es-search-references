import type {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

import type {
  SVGGraphView
} from "./svg-graph.js";

export class GraphControlsView implements BaseView {
  static #getGraphNodeOption(
    this: void,
    nodeId: string
  ): HTMLOptionElement
  {
    return new Option(nodeId, nodeId);
  }

  readonly displayElement: HTMLElement = document.getElementById("graph-controls-overlay")!;
  readonly #toggleCollapseButton: HTMLElement = document.getElementById("graph-controls-toggle")!;

  readonly #expandImage = document.createElement("img");
  readonly #collapseImage = document.createElement("img");
  readonly #zoomLevelElement = document.getElementById("zoom-level") as HTMLInputElement;
  readonly #scrollToNodeSelect = document.getElementById("scroll-to-node") as HTMLSelectElement;
  readonly #pathsSelect = document.getElementById("select-path") as HTMLSelectElement;

  #currentGraphView: SVGGraphView | undefined;

  constructor() {
    this.#toggleCollapseButton.onclick = event => this.#handleToggleCollapse(event);
    this.#expandImage.src = "./images/button-expand.svg";
    this.#collapseImage.src = "./images/button-collapse.svg";

    this.#zoomLevelElement.onchange = event => this.#handleZoomChange(event);
    this.#scrollToNodeSelect.onchange = event => this.#handleNodeSelect(event);
    this.#pathsSelect.onchange = event => this.#handlePathsSelect(event);
  }

  dispose(): void {
    throw new Error("this is not implemented, on a singleton");
  }

  #handleToggleCollapse(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.displayElement.classList.toggle("collapsed")
  }

  set currentGraphView(view: SVGGraphView | undefined) {
    this.#currentGraphView = view;
    if (view) {
      void view.promiseInitialized.then((): void => {
        this.#zoomLevelElement.valueAsNumber = view.getZoomLevel();
        this.displayElement.classList.remove("hidden");

        let options: HTMLOptionElement[] = [
          this.#scrollToNodeSelect.options[0], // empty option
          ...this.#currentGraphView!.getNodeIds().map(GraphControlsView.#getGraphNodeOption)
        ];
        this.#scrollToNodeSelect.replaceChildren(...options);

        options = Array.from(this.#pathsSelect.options);
        const { pathsCount } = this.#currentGraphView!;
        while (options.length <= pathsCount) {
          options.push(GraphControlsView.#getGraphNodeOption("paths:" + (options.length - 1)));
        }
        options.length = pathsCount + 1;
        this.#pathsSelect.replaceChildren(...options);
      });
    } else {
      this.displayElement.classList.add("hidden");
      if (this.#scrollToNodeSelect.childElementCount > 1)
        this.#scrollToNodeSelect.replaceChildren(this.#scrollToNodeSelect.firstElementChild!);
    }
  }

  #handleZoomChange(event: Event): void {
    event.stopPropagation();
    this.#currentGraphView!.setZoomLevel(this.#zoomLevelElement.valueAsNumber);
  }

  #handleNodeSelect(event: Event): void {
    event.stopPropagation();
    this.#currentGraphView!.selectNode(this.#scrollToNodeSelect.value);
  }

  #handlePathsSelect(event?: Event): void {
    event?.stopPropagation();
    this.#currentGraphView!.selectPath(this.#pathsSelect.value);
  }
}
