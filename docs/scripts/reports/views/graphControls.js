export class GraphControlsView {
    static #getGraphNodeOption(nodeId) {
        return new Option(nodeId, nodeId);
    }
    displayElement = document.getElementById("graph-controls-overlay");
    #toggleCollapseButton = document.getElementById("graph-controls-toggle");
    #expandImage = document.createElement("img");
    #collapseImage = document.createElement("img");
    #zoomLevelElement = document.getElementById("zoom-level");
    #scrollToNodeSelect = document.getElementById("scroll-to-node");
    #currentGraphView;
    constructor() {
        this.#toggleCollapseButton.onclick = event => this.#handleToggleCollapse(event);
        this.#expandImage.src = "./images/button-expand.svg";
        this.#collapseImage.src = "./images/button-collapse.svg";
        this.#zoomLevelElement.onchange = event => this.#handleZoomChange(event);
        this.#scrollToNodeSelect.onchange = event => this.#handleNodeSelect(event);
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
            const options = [
                this.#scrollToNodeSelect.options[0], // empty option
                ...this.#currentGraphView.getNodeIds().map(GraphControlsView.#getGraphNodeOption)
            ];
            this.#scrollToNodeSelect.replaceChildren(...options);
        }
        else {
            this.displayElement.classList.add("hidden");
            if (this.#scrollToNodeSelect.childElementCount > 1)
                this.#scrollToNodeSelect.replaceChildren(this.#scrollToNodeSelect.firstElementChild);
        }
    }
    #handleZoomChange(event) {
        event.stopPropagation();
        this.#currentGraphView.setZoomLevel(this.#zoomLevelElement.valueAsNumber);
    }
    #handleNodeSelect(event) {
        event.stopPropagation();
        this.#currentGraphView.showNode(this.#scrollToNodeSelect.value);
    }
}
