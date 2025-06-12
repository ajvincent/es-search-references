import { TreeRowElement } from "../elements/tree-row.js";
export class TreeRowView {
    static buildEmptySpan() {
        return document.createElement("span");
    }
    rowElement;
    depth;
    isCollapsible;
    primaryLabel;
    #childRowViews = [];
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
        for (const view of this.#childRowViews) {
            view.#disposeAllViews();
        }
        this.#childRowViews.splice(0, this.#childRowViews.length);
    }
    buildPrimaryLabelElement() {
        const label = document.createElement("label");
        label.classList.add("indent");
        label.append(this.primaryLabel);
        return label;
    }
    prependRow(rowView) {
        this.rowElement.insertRow(rowView.rowElement, this.#childRowViews[0]?.rowElement);
        this.#childRowViews.unshift(rowView);
    }
    insertRowSorted(rowView) {
        let referenceRow;
        const newLabel = rowView.primaryLabel;
        let index = 0;
        for (const existingRow of this.#childRowViews) {
            if (existingRow.primaryLabel.localeCompare(newLabel) <= 0) {
                index++;
                continue;
            }
            referenceRow = existingRow;
            break;
        }
        this.#childRowViews.splice(index, 0, rowView);
        this.rowElement.insertRow(rowView.rowElement, referenceRow?.rowElement);
    }
    removeRow(rowView) {
        const index = this.#childRowViews.indexOf(rowView);
        if (index === -1)
            throw new Error("row not found");
        this.#childRowViews.splice(index, 1);
        rowView.removeAndDispose();
    }
    addRow(rowView) {
        this.rowElement.addRow(rowView.rowElement);
        this.#childRowViews.push(rowView);
    }
    get isCollapsed() {
        return this.rowElement.isCollapsed;
    }
    toggleCollapsed() {
        this.rowElement.toggleCollapsed();
    }
}
