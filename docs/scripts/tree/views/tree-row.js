export class TreeRowElement extends HTMLElement {
    static #baseRowTemplate = document.getElementById("tree-row-base").content;
    #childrenWrapper = document.createElement("tree-children");
    connectedCallback() {
        this.append(...this.getCellElements(), this.#childrenWrapper);
    }
    addRow(row) {
        this.#childrenWrapper.append(row);
    }
}
