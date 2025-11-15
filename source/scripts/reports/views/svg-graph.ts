import {
  d3,
  dagre,
  render as RenderCtor,
} from "../../../lib/packages/dagre-imports.js";

import type {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

import {
  SVGGraphNodeView,
  SVGGraphPopupLocation,
  type GraphNode,
} from "./SVGGraphNodeView.js";

import type {
  SVGGraphViewIfc
} from "../types/SVGGraphViewIfc.js";

export class SVGGraphView implements BaseView, SVGGraphViewIfc {
  static readonly #templateNode: DocumentFragment = (document.getElementById("svg-graph-base") as HTMLTemplateElement).content;
  static #idCounter = 0;

  static #getIdNumber(id: `${string}:${number}`): number {
    return parseInt(id.substring(id.lastIndexOf(":") + 1));
  }

  readonly graph: dagre.graphlib.Graph;

  readonly displayElement: HTMLElement;
  readonly #svgElement: SVGSVGElement;
  readonly #graphicsElement: SVGGraphicsElement;
  readonly popupsParent: SVGGElement = document.createElementNS("http://www.w3.org/2000/svg", "g");

  readonly #nodeIdToViewMap = new Map<string, SVGGraphNodeView>;
  #selectedId: string = "";

  handleActivated: () => void;

  #zoomLevel = 0;

  constructor(
    graph: dagre.graphlib.Graph,
  )
  {
    this.graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));

    this.displayElement = document.createElement("div");
    this.displayElement.append(SVGGraphView.#templateNode.cloneNode(true));
    this.displayElement.id = "svg-graph-wrapper-" + (SVGGraphView.#idCounter++);

    this.#svgElement = this.displayElement.querySelector("svg") as SVGSVGElement;
    this.#graphicsElement = this.displayElement.querySelector(".graph") as SVGGraphicsElement;

    const { promise, resolve } = Promise.withResolvers<void>();
    this.handleActivated = resolve;

    promise.then(() => this.#createRenderGraph());
  }

  dispose(): void {
    this.displayElement.remove();
    this.#nodeIdToViewMap.clear();
  }

  get svgSelector() {
    return `#${this.displayElement.id} > svg`;
  }

  getZoomLevel(): number {
    return this.#zoomLevel;
  }

  setZoomLevel(newZoom: number) {
    this.#zoomLevel = newZoom;
    newZoom = Math.pow(1.2, newZoom);
    const matrix = this.#svgElement.createSVGMatrix();
    matrix.a = newZoom;
    matrix.d = newZoom;
    const newTransform = this.#svgElement.createSVGTransformFromMatrix(matrix);
    const { baseVal } = this.#graphicsElement.transform;

    if (baseVal.numberOfItems < 2) {
      baseVal.appendItem(newTransform);
    } else {
      baseVal.replaceItem(newTransform, 1);
    }
  }

  getNodeIds(): readonly string[] {
    const nodes = this.graph.nodes() as readonly (`${string}:${number}`)[];
    const results: string[] = [];
    results.length = nodes.length;
    nodes.forEach(n => {
      const index = SVGGraphView.#getIdNumber(n);
      results[index] = n;
    });
    return results;
  }

  selectNode(nodeId: string): void {
    const previousView = this.#nodeIdToViewMap.get(this.#selectedId);
    previousView?.hideSelected();

    this.#selectedId = nodeId;
    const view = this.#nodeIdToViewMap.get(nodeId);
    if (view) {
      view.scrollIntoView();
      view.showSelected();
    }
  }

  #createRenderGraph(): void {
    const renderer = new RenderCtor();
    const svg = d3.select(this.svgSelector);
    const group = svg.select("g");

    renderer(group, this.graph);
    svg.attr("width", this.graph.graph().width! + SVGGraphPopupLocation.width / 2);
    svg.attr(
      "height",
      this.graph.graph().height! + SVGGraphPopupLocation.height + SVGGraphPopupLocation.y
    );

    this.#graphicsElement.querySelector(".output")!.append(this.popupsParent);

    this.graph.nodes().forEach((nodeId: string): void => {
      const node = this.graph.node(nodeId) as unknown as GraphNode;
      const view = new SVGGraphNodeView(nodeId, node, this);
      this.#nodeIdToViewMap.set(nodeId, view);
    });

    this.selectNode("heldValues:1");
  }
}
