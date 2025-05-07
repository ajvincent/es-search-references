import type {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

export class SVGGraphView implements BaseView {
  static readonly #templateNode: DocumentFragment = (document.getElementById("svg-graph-base") as HTMLTemplateElement).content;
  static #idCounter = 0;
  displayElement: HTMLElement;

  activatedPromise: Promise<void>;
  handleActivated: () => void;

  constructor() {
    this.displayElement = document.createElement("div");
    this.displayElement.append(SVGGraphView.#templateNode.cloneNode(true));
    this.displayElement.id = "svg-graph-wrapper-" + (SVGGraphView.#idCounter++);

    const { promise, resolve } = Promise.withResolvers<void>();
    this.activatedPromise = promise;
    this.handleActivated = resolve;
  }

  get svgSelector() {
    return `#${this.displayElement.id} > svg`;
  }
}
