import {
  d3,
  dagre,
  render as RenderCtor,
} from "../../../lib/packages/dagre-imports.js";

import type {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

import {
  JSGraphConstants,
  type JSGraphNode,
} from "../../../lib/packages/runSearchesInGuestEngine.js";

type IconAndIsStrongRef = readonly [string, boolean];

interface GraphNode extends JSGraphNode {
  elem: SVGGElement;
}

export class SVGGraphView implements BaseView {
  static readonly #templateNode: DocumentFragment = (document.getElementById("svg-graph-base") as HTMLTemplateElement).content;
  static #idCounter = 0;

  static #getIdNumber(id: `${string}:${number}`): number {
    return parseInt(id.substring(id.lastIndexOf(":") + 1));
  }

  #graph: dagre.graphlib.Graph;

  displayElement: HTMLElement;
  #svgElement: SVGSVGElement;
  #graphicsElement: SVGGraphicsElement;

  readonly #nodeIdToViewMap = new Map<string, SVGGraphNodeView>;
  #selectedId: string = "";

  handleActivated: () => void;

  #zoomLevel = 0;

  constructor(
    graph: dagre.graphlib.Graph,
  )
  {
    this.#graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));

    this.displayElement = document.createElement("div");
    this.displayElement.append(SVGGraphView.#templateNode.cloneNode(true));
    this.displayElement.id = "svg-graph-wrapper-" + (SVGGraphView.#idCounter++);

    this.#svgElement = this.displayElement.querySelector("svg") as SVGSVGElement;
    this.#graphicsElement = this.displayElement.querySelector(".graph") as SVGGraphicsElement;

    const { promise, resolve } = Promise.withResolvers<void>();
    this.handleActivated = resolve;

    promise.then(() => this.#createRenderGraph());
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
    const nodes = this.#graph.nodes() as readonly (`${string}:${number}`)[];
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

    renderer(group, this.#graph);
    svg.attr("width", this.#graph.graph().width!);
    svg.attr("height", this.#graph.graph().height! + 40);

    this.#graph.nodes().forEach((nodeId: string): void => {
      const node = this.#graph.node(nodeId) as unknown as GraphNode;
      const view = new SVGGraphNodeView(node.elem, nodeId, node.metadata?.builtInJSTypeName);
      this.#nodeIdToViewMap.set(nodeId, view);
    });

    this.selectNode("heldValues:1");
  }
}

class SVGGraphNodeView {
  static readonly #iconAndIsStrongMap: ReadonlyMap<JSGraphConstants.BuiltInJSTypeName, IconAndIsStrongRef> = new Map([
    [JSGraphConstants.BuiltInJSTypeName.Object, ["{}", true]],
    [JSGraphConstants.BuiltInJSTypeName.Array, ["[]", true]],
    [JSGraphConstants.BuiltInJSTypeName.Function, ["fn", true]],
    [JSGraphConstants.BuiltInJSTypeName.AsyncFunction, ["\u23f1", true]],
    [JSGraphConstants.BuiltInJSTypeName.Set, ["()", true]],
    [JSGraphConstants.BuiltInJSTypeName.WeakSet, ["()", false]],
    [JSGraphConstants.BuiltInJSTypeName.Map, ["#", true]],
    [JSGraphConstants.BuiltInJSTypeName.WeakMap, ["#", false]],
    [JSGraphConstants.BuiltInJSTypeName.Promise, ["\u23f3", true]],
    [JSGraphConstants.BuiltInJSTypeName.Proxy, ["\u2248", true]],
    [JSGraphConstants.BuiltInJSTypeName.Generator, ["*", true]],
    [JSGraphConstants.BuiltInJSTypeName.AsyncGenerator, ["*", true]],
    [JSGraphConstants.BuiltInJSTypeName.ArrayIterator, ["\u23ef", true]],
    [JSGraphConstants.BuiltInJSTypeName.MapIterator, ["\u23ef", true]],
    [JSGraphConstants.BuiltInJSTypeName.SetIterator, ["\u23ef", true]],
    [JSGraphConstants.BuiltInJSTypeName.IteratorHelper, ["\u23ef", true]],
    [JSGraphConstants.BuiltInJSTypeName.WeakRef, ["\u2192", false]],
    [JSGraphConstants.BuiltInJSTypeName.FinalizationRegistry, ["\u267b", false]],
  ]);

  readonly #element: SVGGElement;

  constructor(
    element: SVGGElement,
    nodeId: string,
    builtInType: JSGraphConstants.BuiltInJSTypeName | undefined,
  )
  {
    this.#element = element;

    if (nodeId === "target:0" || nodeId === "heldValues:1") {
      this.#addInnerCircle();
    }

    if (builtInType) {
      const iconAndIsStrongRef = SVGGraphNodeView.#iconAndIsStrongMap.get(builtInType);
      if (iconAndIsStrongRef) {
        const [icon, isStrong] = iconAndIsStrongRef;

        const textElement: SVGTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.classList.add(icon.length === 1 ? "builtin-icon" : "builtin-icon-pair");
        if (!isStrong)
          textElement.classList.add("grey");
        textElement.append(icon);

        const titleElement: SVGTitleElement = document.createElementNS("http://www.w3.org/2000/svg", "title");
        titleElement.append(builtInType);

        element.append(textElement, titleElement);
      }
    }
  }

  #addInnerCircle(): void {
    const outerCircle = this.#element.firstElementChild as SVGCircleElement;
    const innerCircle = outerCircle.cloneNode(false) as SVGCircleElement;
    const outerRadius: number = parseInt(outerCircle.getAttribute("r")!);
    innerCircle.setAttribute("r", (outerRadius - 6).toString(10));
    outerCircle.after(innerCircle);
  }

  showSelected(): void {
    this.#element.classList.add("selected");
  }

  hideSelected(): void {
    this.#element.classList.remove("selected");
  }

  scrollIntoView(): void {
    this.#element.scrollIntoView({block: "center", inline: "center"});
  }
}
