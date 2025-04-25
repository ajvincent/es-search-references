class TreeRowElement extends HTMLElement {
    #childrenWrapper = document.createElement("tree-children");
    constructor() {
        super();
    }
    connectedCallback() {
        this.append(...this.getCellElements(), this.#childrenWrapper);
    }
    getCellElements() {
        return [];
    }
    get labelElement() {
        return null;
    }
    addRow(row) {
        this.#childrenWrapper.append(row);
    }
    toggleCollapsed() {
        this.classList.toggle("collapsed");
    }
}
window.customElements.define("tree-row", TreeRowElement);
export { TreeRowElement };
