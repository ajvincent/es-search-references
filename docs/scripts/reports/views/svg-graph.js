export class SVGGraphView {
    static #templateNode = document.getElementById("svg-graph-base").content;
    static #idCounter = 0;
    displayElement;
    #svgElement;
    #graphicsElement;
    activatedPromise;
    handleActivated;
    #zoomLevel = 0;
    constructor() {
        this.displayElement = document.createElement("div");
        this.displayElement.append(SVGGraphView.#templateNode.cloneNode(true));
        this.displayElement.id = "svg-graph-wrapper-" + (SVGGraphView.#idCounter++);
        this.#svgElement = this.displayElement.querySelector("svg");
        this.#graphicsElement = this.displayElement.querySelector(".graph");
        const { promise, resolve } = Promise.withResolvers();
        this.activatedPromise = promise;
        this.handleActivated = resolve;
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
    showHeldValuesNode() {
        const heldValuesNode = this.#graphicsElement.querySelector(".heldValues-node");
        heldValuesNode.scrollIntoView({ block: "center" });
    }
}
