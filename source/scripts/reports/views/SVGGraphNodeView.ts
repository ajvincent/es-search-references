import {
  dagre,
} from "../../../lib/packages/dagre-imports.js";

import {
  type JSGraphNode,
  JSGraphConstants
} from "../../../lib/packages/runSearchesInGuestEngine.js";

import type {
  SVGGraphViewIfc
} from "../types/SVGGraphViewIfc.js";

type IconAndIsStrongRef = readonly [string, boolean];

export interface GraphNode extends JSGraphNode {
  readonly elem: SVGGElement;
}

export const SVGGraphPopupLocation: Record<"width" | "height" | "x" | "y", number> = {
  x: -150,
  y: 60,
  width: 360,
  height: 100,
};

export class SVGGraphNodeView {
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
    [JSGraphConstants.BuiltInJSTypeName.Symbol, ["\u24e2", true]],
    [JSGraphConstants.BuiltInJSTypeName.FinalizationRegistry, ["\u267b", false]],
  ]);

  static readonly #popupTemplateNode: SVGForeignObjectElement = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  static {
    this.#popupTemplateNode.setAttribute("x", SVGGraphPopupLocation.x.toString());
    this.#popupTemplateNode.setAttribute("y", SVGGraphPopupLocation.y.toString());
    this.#popupTemplateNode.setAttribute("width", SVGGraphPopupLocation.width.toString());
    this.#popupTemplateNode.setAttribute("height", SVGGraphPopupLocation.height.toString());
    const template: DocumentFragment = (document.getElementById("svg-node-overlay") as HTMLTemplateElement).content;
    this.#popupTemplateNode.append(template.cloneNode(true));
  }

  static readonly #thisElm: HTMLSpanElement = document.createElement("span");
  static {
    this.#thisElm.append("this");
  }

  static #addPopupRow(parent: HTMLElement, ...grandchildren: readonly Node[]): void {
    const outerSpan: HTMLSpanElement = document.createElement("span");
    outerSpan.append(...grandchildren);
    parent.append(outerSpan);
  }

  readonly #id: string;
  readonly #node: GraphNode;
  readonly #graphView: SVGGraphViewIfc;
  #popup?: SVGForeignObjectElement;

  constructor(
    id: string,
    node: GraphNode,
    graphView: SVGGraphViewIfc
  ) {
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
    this.#node.elem.scrollIntoView({ block: "center", inline: "center" });
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
    if (this.#node.metadata) {
      classElement.append(this.#node.metadata.derivedClassName);
      if (this.#node.metadata.classSpecifier) {
        classElement.classList.add("isClassLink");
        classElement.onclick = event => this.#handleClassNameClick(event);
      }
    }

    const inEdgesElement: HTMLElement = this.#popup.querySelector("in-edges") as HTMLElement;
    for (const edge of this.#graphView.graph.inEdges(this.#id)!) {
      const vIdElm: HTMLAnchorElement = this.#buildNodeLink(edge.v);
      const nameElm: HTMLSpanElement = this.#buildNameElm(edge);
      SVGGraphNodeView.#addPopupRow(inEdgesElement, vIdElm, nameElm, SVGGraphNodeView.#thisElm.cloneNode(true));
    }

    const outEdgesElement: HTMLElement = this.#popup.querySelector("out-edges") as HTMLElement;
    for (const edge of this.#graphView.graph.outEdges(this.#id)!) {
      const nameElm: HTMLSpanElement = this.#buildNameElm(edge);
      const wIdElm: HTMLAnchorElement = this.#buildNodeLink(edge.w);
      SVGGraphNodeView.#addPopupRow(outEdgesElement, SVGGraphNodeView.#thisElm.cloneNode(true), nameElm, wIdElm);
    }

    this.#graphView.popupsParent.append(this.#popup);
  }

  #buildNodeLink(nodeId: string): HTMLAnchorElement {
    const anchorElm: HTMLAnchorElement = document.createElement("a");
    anchorElm.href = "#";
    anchorElm.onclick = this.#handleNodeIdClick.bind(this, nodeId);
    anchorElm.append(nodeId);
    return anchorElm;
  }

  #buildNameElm(edge: dagre.Edge): HTMLSpanElement {
    const nameElm: HTMLSpanElement = document.createElement("span");
    let name: string = edge.name!;
    if (this.#graphView.graph)
      name = this.#graphView.graph.edge(edge).label as string ?? edge.name;
    nameElm.append(name);
    nameElm.classList.add("edge");

    const { isStrongReference } = this.#graphView.graph.edge(edge);
    if (!isStrongReference) {
      nameElm.classList.add("weakreference");
    }

    return nameElm;
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
