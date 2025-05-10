import type {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

export class SVGGraphView implements BaseView {
  static readonly #templateNode: DocumentFragment = (document.getElementById("svg-graph-base") as HTMLTemplateElement).content;
  static #idCounter = 0;
  displayElement: HTMLElement;
  #svgElement: SVGSVGElement;
  #graphicsElement: SVGGraphicsElement;

  activatedPromise: Promise<void>;
  handleActivated: () => void;

  #zoomLevel = 1;

  constructor() {
    this.displayElement = document.createElement("div");
    this.displayElement.append(SVGGraphView.#templateNode.cloneNode(true));
    this.displayElement.id = "svg-graph-wrapper-" + (SVGGraphView.#idCounter++);

    this.#svgElement = this.displayElement.querySelector("svg") as SVGSVGElement;
    this.#graphicsElement = this.displayElement.querySelector(".graph") as SVGGraphicsElement;

    const { promise, resolve } = Promise.withResolvers<void>();
    this.activatedPromise = promise;
    this.handleActivated = resolve;
  }

  get svgSelector() {
    return `#${this.displayElement.id} > svg`;
  }

  getZoomLevel(): number {
    return this.#zoomLevel;
  }

  setZoomLevel(newZoom: number) {
    this.#zoomLevel = newZoom;
    const matrix = this.#svgElement.createSVGMatrix();
    matrix.a = newZoom;
    matrix.d = newZoom;
    const newTransform = this.#svgElement.createSVGTransformFromMatrix(matrix);
    const { baseVal } = this.#graphicsElement.transform;

    if (baseVal.numberOfItems < 1) {
      baseVal.appendItem(newTransform);
    } else {
      baseVal.replaceItem(newTransform, 0);
    }
  }

  showHeldValuesNode(): void {
    const heldValuesNode = this.#graphicsElement.querySelector(".heldValues-node") as SVGGElement;
    heldValuesNode.scrollIntoView({block: "center"});
  }
}
