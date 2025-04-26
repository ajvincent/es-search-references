export class TreeRowElement extends HTMLElement {
    constructor(depth, isCollapsible, cells) {
        super();
        if (depth % 2 === 1) {
            this.classList.add("depth-odd");
        }
        else if (depth > 0) {
            this.classList.add("depth-even");
        }
        if (isCollapsible) {
            this.classList.add("is-collapsible");
        }
        this.append(...cells);
    }
    connectedCallback() {
    }
    addRow(row) {
        this.append(row);
    }
    get isCollapsed() {
        return this.classList.contains("collapsed");
    }
    toggleCollapsed() {
        this.classList.toggle("collapsed");
    }
}
window.customElements.define("tree-row", TreeRowElement);
