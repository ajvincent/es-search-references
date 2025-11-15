import { d3, dagre, render as RenderCtor, } from "../../../lib/packages/dagre-imports.js";
import { SVGGraphNodeView, SVGGraphPopupLocation, } from "./SVGGraphNodeView.js";
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
    dispose() {
        this.displayElement.remove();
        this.#nodeIdToViewMap.clear();
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
        svg.attr("width", this.graph.graph().width + SVGGraphPopupLocation.width / 2);
        svg.attr("height", this.graph.graph().height + SVGGraphPopupLocation.height + SVGGraphPopupLocation.y);
        this.#graphicsElement.querySelector(".output").append(this.popupsParent);
        this.graph.nodes().forEach((nodeId) => {
            const node = this.graph.node(nodeId);
            const view = new SVGGraphNodeView(nodeId, node, this);
            this.#nodeIdToViewMap.set(nodeId, view);
        });
        this.selectNode("heldValues:1");
    }
}
