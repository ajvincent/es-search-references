import type {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

import type {
  SVGGraphView
} from "./svg-graph.js";

export class GraphControlsView implements BaseView {
  static #getGraphNodeOption(nodeId: string): HTMLOptionElement {
    return new Option(nodeId, nodeId);
  }

  readonly displayElement: HTMLElement = document.getElementById("graph-controls-overlay")!;
  readonly #toggleCollapseButton: HTMLElement = document.getElementById("graph-controls-toggle")!;

  readonly #expandImage = document.createElement("img");
  readonly #collapseImage = document.createElement("img");
  readonly #zoomLevelElement = document.getElementById("zoom-level") as HTMLInputElement;
  readonly #scrollToNodeSelect = document.getElementById("scroll-to-node") as HTMLSelectElement;

  #currentGraphView: SVGGraphView | undefined;

  constructor() {
    this.#toggleCollapseButton.onclick = event => this.#handleToggleCollapse(event);
    this.#expandImage.src = "./images/button-expand.svg";
    this.#collapseImage.src = "./images/button-collapse.svg";

    this.#zoomLevelElement.onchange = event => this.#handleZoomChange(event);
    this.#scrollToNodeSelect.onchange = event => this.#handleNodeSelect(event);
  }

  #handleToggleCollapse(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.displayElement.classList.toggle("collapsed")
  }

  set currentGraphView(view: SVGGraphView | undefined) {
    this.#currentGraphView = view;
    if (view) {
      this.#zoomLevelElement.valueAsNumber = view.getZoomLevel();
      this.displayElement.classList.remove("hidden");

      const options: HTMLOptionElement[] = [
        this.#scrollToNodeSelect.options[0], // empty option
        ...this.#currentGraphView!.getNodeIds().map(GraphControlsView.#getGraphNodeOption)
      ];
      this.#scrollToNodeSelect.replaceChildren(...options);
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
}
