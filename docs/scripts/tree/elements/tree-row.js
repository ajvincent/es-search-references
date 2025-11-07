export class TreeRowElement extends HTMLElement {
    constructor(depth, isCollapsible) {
        super();
        this.refreshDepthClass(depth);
        if (isCollapsible) {
            this.classList.add("is-collapsible");
        }
    }
    addCells(cells) {
        this.prepend(...cells);
    }
    insertRow(newRow, referenceRow) {
        if (referenceRow)
            referenceRow.before(newRow);
        else
            this.append(newRow);
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
    refreshDepthClass(newDepth) {
        if (newDepth % 2 === 1) {
            this.classList.add("depth-odd");
            this.classList.remove("depth-even");
        }
        else {
            this.classList.remove("depth-odd");
            this.classList.add("depth-even");
        }
    }
}
window.customElements.define("tree-row", TreeRowElement);
