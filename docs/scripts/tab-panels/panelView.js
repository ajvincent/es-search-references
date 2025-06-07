export class GenericPanelView {
    #mayDispose;
    displayElement;
    constructor(elementId, mayDispose) {
        this.displayElement = document.getElementById(elementId);
        this.#mayDispose = mayDispose;
    }
    dispose() {
        if (this.#mayDispose)
            this.displayElement.remove();
    }
}
