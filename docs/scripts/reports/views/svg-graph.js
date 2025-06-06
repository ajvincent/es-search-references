var _a;
import { d3, dagre, render as RenderCtor, } from "../../../lib/packages/dagre-imports.js";
import { JSGraphConstants, } from "../../../lib/packages/runSearchesInGuestEngine.js";
export class SVGGraphView {
    static #templateNode = document.getElementById("svg-graph-base").content;
    static #idCounter = 0;
    static #getIdNumber(id) {
        return parseInt(id.substring(id.lastIndexOf(":") + 1));
    }
    graph;
    displayElement;
    #svgElement;
    #graphicsElement;
    popupsParent = document.createElementNS("http://www.w3.org/2000/svg", "g");
    #nodeIdToViewMap = new Map;
    #selectedId = "";
    handleActivated;
    #zoomLevel = 0;
    constructor(graph) {
        this.graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));
        this.displayElement = document.createElement("div");
        this.displayElement.append(SVGGraphView.#templateNode.cloneNode(true));
        this.displayElement.id = "svg-graph-wrapper-" + (SVGGraphView.#idCounter++);
        this.#svgElement = this.displayElement.querySelector("svg");
        this.#graphicsElement = this.displayElement.querySelector(".graph");
        const { promise, resolve } = Promise.withResolvers();
        this.handleActivated = resolve;
        promise.then(() => this.#createRenderGraph());
    }
    get svgSelector() {
        return `#${this.displayElement.id} > svg`;
    }
    getZoomLevel() {
        return this.#zoomLevel;
    }
    setZoomLevel(newZoom) {
        this.#zoomLevel = newZoom;
        newZoom = Math.pow(1.2, newZoom);
        const matrix = this.#svgElement.createSVGMatrix();
        matrix.a = newZoom;
        matrix.d = newZoom;
        const newTransform = this.#svgElement.createSVGTransformFromMatrix(matrix);
        const { baseVal } = this.#graphicsElement.transform;
        if (baseVal.numberOfItems < 2) {
            baseVal.appendItem(newTransform);
        }
        else {
            baseVal.replaceItem(newTransform, 1);
        }
    }
    getNodeIds() {
        const nodes = this.graph.nodes();
        const results = [];
        results.length = nodes.length;
        nodes.forEach(n => {
            const index = SVGGraphView.#getIdNumber(n);
            results[index] = n;
        });
        return results;
    }
    selectNode(nodeId) {
        const previousView = this.#nodeIdToViewMap.get(this.#selectedId);
        previousView?.hideSelected();
        this.#selectedId = nodeId;
        const view = this.#nodeIdToViewMap.get(nodeId);
        if (view) {
            view.scrollIntoView();
            view.showSelected();
        }
    }
    #createRenderGraph() {
        const renderer = new RenderCtor();
        const svg = d3.select(this.svgSelector);
        const group = svg.select("g");
        renderer(group, this.graph);
        svg.attr("width", this.graph.graph().width);
        svg.attr("height", this.graph.graph().height + 40);
        this.#graphicsElement.querySelector(".output").append(this.popupsParent);
        this.graph.nodes().forEach((nodeId) => {
            const node = this.graph.node(nodeId);
            const view = new SVGGraphNodeView(nodeId, node, this);
            this.#nodeIdToViewMap.set(nodeId, view);
        });
        this.selectNode("heldValues:1");
    }
}
class SVGGraphNodeView {
    static #iconAndIsStrongMap = new Map([
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
    static #popupTemplateNode = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    static {
        this.#popupTemplateNode.setAttribute("x", "-150");
        this.#popupTemplateNode.setAttribute("y", "60");
        this.#popupTemplateNode.setAttribute("width", "360");
        this.#popupTemplateNode.setAttribute("height", "100");
        const template = document.getElementById("svg-node-overlay").content;
        this.#popupTemplateNode.append(template.cloneNode(true));
    }
    static #thisElm = document.createElement("span");
    static {
        this.#thisElm.append("this");
    }
    static #addPopupRow(parent, ...grandchildren) {
        const outerSpan = document.createElement("span");
        outerSpan.append(...grandchildren);
        parent.append(outerSpan);
    }
    #id;
    #node;
    #graphView;
    #popup;
    constructor(id, node, graphView) {
        this.#id = id;
        this.#node = node;
        this.#graphView = graphView;
        if (id === "target:0" || id === "heldValues:1") {
            this.#addInnerCircle();
        }
        const builtInType = node.metadata?.builtInJSTypeName;
        if (builtInType) {
            const iconAndIsStrongRef = _a.#iconAndIsStrongMap.get(builtInType);
            if (iconAndIsStrongRef) {
                const [icon, isStrong] = iconAndIsStrongRef;
                const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
                textElement.classList.add(icon.length === 1 ? "builtin-icon" : "builtin-icon-pair");
                if (!isStrong)
                    textElement.classList.add("grey");
                textElement.append(icon);
                const titleElement = document.createElementNS("http://www.w3.org/2000/svg", "title");
                titleElement.append(builtInType);
                this.#node.elem.append(textElement, titleElement);
            }
        }
        if (this.#node.metadata)
            node.elem.onclick = event => this.#toggleOverlay(event);
    }
    #addInnerCircle() {
        const outerCircle = this.#node.elem.firstElementChild;
        const innerCircle = outerCircle.cloneNode(false);
        const outerRadius = parseInt(outerCircle.getAttribute("r"));
        innerCircle.setAttribute("r", (outerRadius - 6).toString(10));
        outerCircle.after(innerCircle);
    }
    showSelected() {
        this.#node.elem.classList.add("selected");
    }
    hideSelected() {
        this.#node.elem.classList.remove("selected");
    }
    scrollIntoView() {
        this.#node.elem.scrollIntoView({ block: "center", inline: "center" });
    }
    #toggleOverlay(event) {
        event?.preventDefault();
        if (this.#popup) {
            this.#popup.classList.toggle("hidden");
            return;
        }
        this.#popup = _a.#popupTemplateNode.cloneNode(true);
        const transform = this.#node.elem.getAttribute("transform");
        this.#popup.setAttribute("transform", transform);
        const classElement = this.#popup.querySelector(".className");
        classElement.append(this.#node.metadata.derivedClassName);
        if (this.#node.metadata.classSpecifier) {
            classElement.classList.add("isLink");
            classElement.onclick = event => this.#handleClassNameClick(event);
        }
        const inEdgesElement = this.#popup.querySelector("in-edges");
        for (const edge of this.#graphView.graph.inEdges(this.#id)) {
            const vIdElm = this.#buildNodeLink(edge.v);
            const nameElm = this.#buildNameElm(edge);
            _a.#addPopupRow(inEdgesElement, vIdElm, nameElm, _a.#thisElm.cloneNode(true));
        }
        const outEdgesElement = this.#popup.querySelector("out-edges");
        for (const edge of this.#graphView.graph.outEdges(this.#id)) {
            const nameElm = this.#buildNameElm(edge);
            const wIdElm = this.#buildNodeLink(edge.w);
            _a.#addPopupRow(outEdgesElement, _a.#thisElm.cloneNode(true), nameElm, wIdElm);
        }
        this.#graphView.popupsParent.append(this.#popup);
    }
    #buildNodeLink(nodeId) {
        const anchorElm = document.createElement("a");
        anchorElm.href = "#";
        anchorElm.onclick = this.#handleNodeIdClick.bind(this, nodeId);
        anchorElm.append(nodeId);
        return anchorElm;
    }
    #buildNameElm(edge) {
        const nameElm = document.createElement("span");
        nameElm.append(edge.name);
        nameElm.classList.add("edge");
        const { isStrongReference } = this.#graphView.graph.edge(edge);
        if (!isStrongReference) {
            nameElm.classList.add("weakreference");
        }
        return nameElm;
    }
    #handleClassNameClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const specifierEvent = new CustomEvent("classClick", {
            detail: {
                classSpecifier: this.#node.metadata.classSpecifier,
                classLineNumber: this.#node.metadata.classLineNumber
            }
        });
        this.#node.elem.dispatchEvent(specifierEvent);
    }
    #handleNodeIdClick(nodeId, event) {
        event.preventDefault();
        event.stopPropagation();
        this.#toggleOverlay();
        this.#graphView.selectNode(nodeId);
    }
}
_a = SVGGraphNodeView;
