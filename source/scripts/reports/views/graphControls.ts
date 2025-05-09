import type {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

import type {
  SVGGraphView
} from "./svg-graph.js";

export class GraphControlsView implements BaseView {
  readonly displayElement: HTMLElement = document.getElementById("graph-controls-overlay")!;
  readonly #toggleCollapseButton: HTMLElement = document.getElementById("graph-controls-toggle")!;

  readonly #expandImage = document.createElement("img");
  readonly #collapseImage = document.createElement("img");
  readonly #zoomLevelElement = document.getElementById("zoom-level") as HTMLInputElement;

  #currentGraphView: SVGGraphView | undefined;

  constructor() {
    this.#toggleCollapseButton.onclick = event => this.#handleToggleCollapse(event);
    this.#expandImage.src = "./images/button-expand.svg";
    this.#collapseImage.src = "./images/button-collapse.svg";

    this.#zoomLevelElement.onchange = event => this.#handleZoomChange(event);
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
    } else {
      this.displayElement.classList.add("hidden");
    }
  }

  #handleZoomChange(event: Event): void {
    event.stopPropagation();
    this.#currentGraphView!.setZoomLevel(this.#zoomLevelElement.valueAsNumber);
  }
}
