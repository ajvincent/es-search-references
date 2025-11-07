import { TreeRowElement } from "../elements/tree-row.js";
export class TreeRowView {
    static buildEmptySpan() {
        return document.createElement("span");
    }
    rowElement;
    #primaryLabel;
    #primaryLabelElement;
    #depth;
    get depth() {
        return this.#depth;
    }
    isCollapsible;
    #childRowViews = [];
    constructor(depth, isCollapsible, primaryLabel) {
        this.#depth = depth;
        this.isCollapsible = isCollapsible;
        this.#primaryLabel = primaryLabel;
        this.rowElement = new TreeRowElement(depth, this.isCollapsible);
    }
    get primaryLabel() {
        return this.#primaryLabel;
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
        label.append(this.#primaryLabel);
        this.#primaryLabelElement = label;
        if (this.isCollapsible) {
            label.onclick = event => this.#handleLabelClick(event);
        }
        return label;
    }
    /**
     * Make the primary label editable.
     *
     * @param newLabelPromise - the new label to apply, or null to revert.
     * @returns the entered text, or null if the user canceled.
     */
    editLabel(newLabelPromise) {
        if (!this.#primaryLabelElement) {
            throw new Error("no label element");
        }
        newLabelPromise.then((label) => {
            if (typeof label === "string") {
                this.#primaryLabel = this.#primaryLabelElement.innerText = label;
            }
            else {
                this.#primaryLabelElement.innerText = this.#primaryLabel;
            }
        });
        let { promise, resolve } = Promise.withResolvers();
        promise = promise.finally(() => {
            this.#primaryLabelElement.contentEditable = "false";
            this.#primaryLabelElement.onkeyup = null;
            this.#primaryLabelElement.onblur = null;
        });
        this.#primaryLabelElement.onkeyup = event => this.#handleLabelKey(resolve, event.key);
        this.#primaryLabelElement.onblur = event => this.#handleLabelKey(resolve, "Escape");
        this.#primaryLabelElement.contentEditable = "plaintext-only";
        this.#primaryLabelElement.focus();
        return promise;
    }
    #handleLabelKey(resolve, key) {
        if (key === "Escape") {
            resolve(null);
        }
        else if (key === "Enter") {
            resolve(this.#primaryLabelElement.innerText.trim());
        }
    }
    prependRow(rowView) {
        this.rowElement.insertRow(rowView.rowElement, this.#childRowViews[0]?.rowElement);
        this.#childRowViews.unshift(rowView);
    }
    insertRowSorted(rowView) {
        let referenceRow;
        const newLabel = rowView.primaryLabel;
        let index = 0;
        let lastChildRow = this.#childRowViews.at(-1);
        if (!lastChildRow || lastChildRow.primaryLabel.localeCompare(newLabel) < 0) {
            this.addRow(rowView);
            return;
        }
        // binary search would probably not be faster in this case: not enough rows to justify it
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
    #handleLabelClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.toggleCollapsed();
    }
}
