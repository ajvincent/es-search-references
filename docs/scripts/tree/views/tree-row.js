import { TreeRowElement } from "../elements/tree-row.js";
export class TreeRowView {
    rowElement;
    depth;
    isCollapsible;
    primaryLabel;
    childRowViews = [];
    constructor(depth, isCollapsible, primaryLabel) {
        this.depth = depth;
        this.isCollapsible = isCollapsible;
        this.primaryLabel = primaryLabel;
        this.rowElement = new TreeRowElement(this.depth, this.isCollapsible);
    }
    addCells() {
        this.rowElement.addCells(this.getCellElements());
    }
    removeAndDispose() {
        this.rowElement.remove();
        return this.#disposeAllViews();
    }
    #disposeAllViews() {
        this.rowElement.remove();
        for (const view of this.childRowViews) {
            view.#disposeAllViews();
        }
        this.childRowViews.splice(0, this.childRowViews.length);
    }
    buildPrimaryLabelElement() {
        const label = document.createElement("label");
        label.classList.add("indent");
        label.append(this.primaryLabel);
        return label;
    }
    addRow(rowView) {
        this.rowElement.addRow(rowView.rowElement);
        this.childRowViews.push(rowView);
    }
    get isCollapsed() {
        return this.rowElement.isCollapsed;
    }
    toggleCollapsed() {
        this.rowElement.toggleCollapsed();
    }
}
