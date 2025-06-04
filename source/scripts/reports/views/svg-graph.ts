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
  readonly elem: SVGGElement;
}

interface SVGGraphViewIfc {
  readonly graph: Pick<dagre.graphlib.Graph, "inEdges" | "outEdges">;
  selectNode(nodeId: string): void;
  readonly popupsParent: SVGGElement;
}

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
    svg.attr("width", this.graph.graph().width!);
    svg.attr("height", this.graph.graph().height! + 40);

    this.#graphicsElement.querySelector(".output")!.append(this.popupsParent);

    this.graph.nodes().forEach((nodeId: string): void => {
      const node = this.graph.node(nodeId) as unknown as GraphNode;
      const view = new SVGGraphNodeView(nodeId, node, this);
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

  static readonly #popupTemplateNode: SVGForeignObjectElement = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  static {
    this.#popupTemplateNode.setAttribute("x", "-150");
    this.#popupTemplateNode.setAttribute("y", "60");
    this.#popupTemplateNode.setAttribute("width", "360");
    this.#popupTemplateNode.setAttribute("height", "100");
    const template: DocumentFragment = (document.getElementById("svg-node-overlay") as HTMLTemplateElement).content;
    this.#popupTemplateNode.append(template.cloneNode(true));
  }

  static readonly #thisElm: HTMLSpanElement = document.createElement("span");
  static {
    this.#thisElm.append("this");
  }

  readonly #id: string;
  readonly #node: GraphNode;
  readonly #graphView: SVGGraphViewIfc;
  #popup?: SVGForeignObjectElement;

  constructor(
    id: string,
    node: GraphNode,
    graphView: SVGGraphViewIfc,
  )
  {
    this.#id = id;
    this.#node = node;
    this.#graphView = graphView;

    if (id === "target:0" || id === "heldValues:1") {
      this.#addInnerCircle();
    }

    const builtInType = node.metadata?.builtInJSTypeName;
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

        this.#node.elem.append(textElement, titleElement);
      }
    }

    if (this.#node.metadata)
      node.elem.onclick = event => this.#toggleOverlay(event);
  }

  #addInnerCircle(): void {
    const outerCircle = this.#node.elem.firstElementChild as SVGCircleElement;
    const innerCircle = outerCircle.cloneNode(false) as SVGCircleElement;
    const outerRadius: number = parseInt(outerCircle.getAttribute("r")!);
    innerCircle.setAttribute("r", (outerRadius - 6).toString(10));
    outerCircle.after(innerCircle);
  }

  showSelected(): void {
    this.#node.elem.classList.add("selected");
  }

  hideSelected(): void {
    this.#node.elem.classList.remove("selected");
  }

  scrollIntoView(): void {
    this.#node.elem.scrollIntoView({block: "center", inline: "center"});
  }

  #toggleOverlay(event?: MouseEvent): void {
    event?.preventDefault();

    if (this.#popup) {
      this.#popup.classList.toggle("hidden");
      return;
    }

    this.#popup = SVGGraphNodeView.#popupTemplateNode.cloneNode(true) as SVGForeignObjectElement;
    const transform = this.#node.elem.getAttribute("transform")!;
    this.#popup.setAttribute("transform", transform);

    const classElement = this.#popup.querySelector(".className") as HTMLAnchorElement;
    classElement.append(this.#node.metadata.derivedClassName);
    if (this.#node.metadata.classSpecifier) {
      classElement.classList.add("isLink");
      classElement.onclick = event => this.#handleClassNameClick(event);
    }

    const inEdgesElement = this.#popup.querySelector("in-edges") as HTMLElement;
    for (const edge of this.#graphView.graph.inEdges(this.#id)!) {
      const vIdElm: HTMLAnchorElement = document.createElement("a");
      vIdElm.href = "#";
      vIdElm.onclick = this.#handleNodeIdClick.bind(this, edge.v);
      vIdElm.append(edge.v);

      const nameElm: HTMLSpanElement = document.createElement("span");
      nameElm.append(edge.name!);
      nameElm.classList.add("edge");

      const outerSpan: HTMLSpanElement = document.createElement("span");
      outerSpan.append(vIdElm, nameElm, SVGGraphNodeView.#thisElm.cloneNode(true));
      inEdgesElement.append(outerSpan);
    }

    const outEdgesElement = this.#popup.querySelector("out-edges") as HTMLElement;
    for (const edge of this.#graphView.graph.outEdges(this.#id)!) {
      const nameElm: HTMLSpanElement = document.createElement("span");
      nameElm.append(edge.name!);
      nameElm.classList.add("edge");

      const wIdElm: HTMLAnchorElement = document.createElement("a");
      wIdElm.href = "#";
      wIdElm.onclick = this.#handleNodeIdClick.bind(this, edge.w);
      wIdElm.append(edge.w);

      const outerSpan: HTMLSpanElement = document.createElement("span");
      outerSpan.append(SVGGraphNodeView.#thisElm.cloneNode(true), nameElm, wIdElm);
      outEdgesElement.append(outerSpan);
    }

    this.#graphView.popupsParent.append(this.#popup);
  }

  #handleClassNameClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const specifierEvent = new CustomEvent("classClick", {
      detail: {
        classSpecifier: this.#node.metadata.classSpecifier!,
        classLineNumber: this.#node.metadata.classLineNumber!
      }
    });
    this.#node.elem.dispatchEvent(specifierEvent);
  }

  #handleNodeIdClick(nodeId: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.#toggleOverlay();
    this.#graphView.selectNode(nodeId);
  }
}
