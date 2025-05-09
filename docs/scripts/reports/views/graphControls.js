export class GraphControlsView {
    displayElement = document.getElementById("graph-controls-overlay");
    #toggleCollapseButton = document.getElementById("graph-controls-toggle");
    #expandImage = document.createElement("img");
    #collapseImage = document.createElement("img");
    #zoomLevelElement = document.getElementById("zoom-level");
    #currentGraphView;
    constructor() {
        this.#toggleCollapseButton.onclick = event => this.#handleToggleCollapse(event);
        this.#expandImage.src = "./images/button-expand.svg";
        this.#collapseImage.src = "./images/button-collapse.svg";
        this.#zoomLevelElement.onchange = event => this.#handleZoomChange(event);
    }
    #handleToggleCollapse(event) {
        event.preventDefault();
        event.stopPropagation();
        this.displayElement.classList.toggle("collapsed");
    }
    set currentGraphView(view) {
        this.#currentGraphView = view;
        if (view) {
            this.#zoomLevelElement.valueAsNumber = view.getZoomLevel();
            this.displayElement.classList.remove("hidden");
        }
        else {
            this.displayElement.classList.add("hidden");
        }
    }
    #handleZoomChange(event) {
        event.stopPropagation();
        this.#currentGraphView.setZoomLevel(this.#zoomLevelElement.valueAsNumber);
    }
}
