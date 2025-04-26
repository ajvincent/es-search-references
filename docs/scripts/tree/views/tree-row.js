import { TreeRowElement } from "../elements/tree-row.js";
export class TreeRowView {
    rowElement;
    RowConstructor = TreeRowElement;
    depth;
    isCollapsible;
    primaryLabel;
    childRowViews = [];
    constructor(depth, isCollapisble, primaryLabel) {
        this.depth = depth;
        this.isCollapsible = isCollapisble;
        this.primaryLabel = primaryLabel;
    }
    initialize() {
        this.rowElement = new this.RowConstructor(this.depth, this.isCollapsible, this.getCellElements());
    }
    removeAndDispose() {
        this.rowElement?.remove();
        return this.#disposeAllViews();
    }
    #disposeAllViews() {
        this.rowElement = undefined;
        const collectedViews = [this];
        for (const view of this.childRowViews) {
            collectedViews.push(...view.#disposeAllViews());
        }
        return collectedViews;
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
