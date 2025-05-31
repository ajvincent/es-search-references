import { d3, dagre, render as RenderCtor, } from "../../../lib/packages/dagre-imports.js";
export class SVGGraphView {
    static #templateNode = document.getElementById("svg-graph-base").content;
    static #idCounter = 0;
    static #getIdNumber(id) {
        return parseInt(id.substring(id.lastIndexOf(":") + 1));
    }
    #graph;
    displayElement;
    #svgElement;
    #graphicsElement;
    #selectedElement;
    handleActivated;
    #zoomLevel = 0;
    constructor(graph) {
        this.#graph = dagre.graphlib.json.read(dagre.graphlib.json.write(graph));
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
        const nodes = this.#graph.nodes();
        const results = [];
        results.length = nodes.length;
        nodes.forEach(n => {
            const index = SVGGraphView.#getIdNumber(n);
            results[index] = n;
        });
        return results;
    }
    showNode(nodeId) {
        this.#selectedElement?.classList.remove("selected");
        const node = this.#graph.node(nodeId);
        this.#selectedElement = node.elem;
        this.#selectedElement.scrollIntoView({ block: "center", inline: "center" });
        this.#selectedElement.classList.add("selected");
    }
    #createRenderGraph() {
        const renderer = new RenderCtor();
        const svg = d3.select(this.svgSelector);
        const group = svg.select("g");
        renderer(group, this.#graph);
        svg.attr("width", this.#graph.graph().width);
        svg.attr("height", this.#graph.graph().height + 40);
        addInnerCircle(svg, "heldValues");
        addInnerCircle(svg, "target");
        addIconAndTitle(svg, "Object", "{}", true);
        addIconAndTitle(svg, "Array", "[]", true);
        addIconAndTitle(svg, "Function", "fn", true);
        addIconAndTitle(svg, "AsyncFunction", "\u23f1", true);
        addIconAndTitle(svg, "Set", "()", true);
        addIconAndTitle(svg, "WeakSet", "()", false);
        addIconAndTitle(svg, "Map", "#", true);
        addIconAndTitle(svg, "WeakMap", "#", false);
        addIconAndTitle(svg, "Promise", "\u23f3", true);
        addIconAndTitle(svg, "Proxy", "\u2248", true);
        addIconAndTitle(svg, "GeneratorPrototype", "*", true);
        addIconAndTitle(svg, "AsyncGenerator", "*", true);
        addIconAndTitle(svg, "ArrayIterator", "\u23ef", true);
        addIconAndTitle(svg, "MapIterator", "\u23ef", true);
        addIconAndTitle(svg, "SetIterator", "\u23ef", true);
        addIconAndTitle(svg, "IteratorHelper", "\u23ef", true);
        addIconAndTitle(svg, "WeakRef", "\u2192", false);
        addIconAndTitle(svg, "FinalizationRegistry", "\u267b", false);
        // this.#graph.node(v).elem === the <g> element for the node
        this.showNode("heldValues:1");
    }
}
function addInnerCircle(svg, prefix) {
    const outerCircle = svg.select(`.${prefix}-node circle`);
    outerCircle.clone().attr("r", parseInt(outerCircle.attr("r")) - 6);
}
function addIconAndTitle(svg, builtIn, icon, isStrong) {
    const selection = svg.selectAll(`.nodes > .builtin-${builtIn}`);
    let classes = icon.length === 1 ? "builtin-icon" : "builtin-icon-pair";
    if (!isStrong) {
        classes += " grey";
    }
    selection.append("text").classed(classes, true).text(icon);
    selection.append("title").text(builtIn);
}
