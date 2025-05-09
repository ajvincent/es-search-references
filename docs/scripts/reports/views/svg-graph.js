export class SVGGraphView {
    static #templateNode = document.getElementById("svg-graph-base").content;
    static #idCounter = 0;
    displayElement;
    activatedPromise;
    handleActivated;
    #zoomLevel = 1;
    constructor() {
        this.displayElement = document.createElement("div");
        this.displayElement.append(SVGGraphView.#templateNode.cloneNode(true));
        this.displayElement.id = "svg-graph-wrapper-" + (SVGGraphView.#idCounter++);
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
    }
}
