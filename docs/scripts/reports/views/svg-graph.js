var _a;
import { d3, dagre, render as RenderCtor, } from "../../../lib/packages/dagre-imports.js";
import { SVGGraphNodeView, SVGGraphPopupLocation, } from "./SVGGraphNodeView.js";
import { buildCustomStylesheet } from "../../utilities/customStylesheet.js";
import { pathsToTarget } from "../../../lib/packages/runSearchesInGuestEngine.js";
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
    #stylesheet;
    #pathsRule;
    #pathsCount = NaN;
    #nodeIdToViewMap = new Map;
    #selectedId = "";
    handleActivated;
    promiseInitialized;
    #zoomLevel = 0;
    constructor(graph) {
        this.graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));
        this.displayElement = document.createElement("div");
        this.displayElement.append(_a.#templateNode.cloneNode(true));
        this.displayElement.id = "svg-graph-wrapper-" + (_a.#idCounter++);
        this.#svgElement = this.displayElement.querySelector("svg");
        this.#graphicsElement = this.displayElement.querySelector(".graph");
        const { promise, resolve } = Promise.withResolvers();
        this.handleActivated = resolve;
        this.promiseInitialized = promise.then(() => this.#createRenderGraph());
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
            const index = _a.#getIdNumber(n);
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
        this.#stylesheet = buildCustomStylesheet(this.displayElement);
        this.graph.nodes().forEach((nodeId) => {
            const node = this.graph.node(nodeId);
            const view = new SVGGraphNodeView(nodeId, node, this);
            this.#nodeIdToViewMap.set(nodeId, view);
        });
        const nodeToPathsMap = this.#getEdgeToPathsMap();
        this.graph.edges().forEach((e) => {
            const hash = _a.#hashEdge(e);
            const edge = this.graph.edge(e);
            const { elem } = edge;
            const paths = nodeToPathsMap.get(hash);
            if (elem && paths)
                elem.dataset.paths = paths;
        });
        this.selectNode("heldValues:1");
    }
    static #hashEdge(edge) {
        const { v, w, name } = edge;
        return JSON.stringify({ v, w, name });
    }
    #getEdgeToPathsMap() {
        const paths = pathsToTarget(this.graph);
        this.#pathsCount = paths.length;
        const edgeToPathsMap = new Map;
        let pathCounter = 0;
        for (const path of paths) {
            const pathHash = "paths:" + pathCounter;
            for (const e of path) {
                const edgeHash = _a.#hashEdge(e);
                if (!edgeToPathsMap.has(edgeHash))
                    edgeToPathsMap.set(edgeHash, new Set);
                edgeToPathsMap.get(edgeHash).add(pathHash);
            }
            pathCounter++;
        }
        const edgeHashMap = new Map(edgeToPathsMap.entries().map(([hash, value]) => [hash, Array.from(value).sort().join(" ")]));
        return edgeHashMap;
    }
    get pathsCount() {
        return this.#pathsCount;
    }
    selectPath(path) {
        if (!this.#pathsRule) {
            this.#stylesheet.insertRule(`
        #${this.displayElement.id} g[data-paths~="${path}"] > path {
          stroke: blue;
          stroke-width: 3px;
        }`);
            this.#pathsRule = this.#stylesheet.cssRules[0];
        }
        this.#pathsRule.selectorText = `#${this.displayElement.id} g[data-paths~="${path}"] > path`;
    }
}
_a = SVGGraphView;
