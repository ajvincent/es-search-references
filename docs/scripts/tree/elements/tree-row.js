export class TreeRowElement extends HTMLElement {
    constructor(depth, isCollapsible) {
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
    }
    addCells(cells) {
        this.prepend(...cells);
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
