export class TreeGridElement extends HTMLElement {
    #rowMap = new Map;
    #RowBuilder;
    constructor(RowBuilder, rootArguments, headerRow) {
        super();
        this.#RowBuilder = RowBuilder;
        const rootRow = new this.#RowBuilder(...rootArguments);
        this.#rowMap.set("", [0, rootRow]);
        this.append(rootRow);
        if (headerRow)
            rootRow.before(...headerRow);
    }
    addRow(parentKey, childKey, rowArguments) {
        if (this.#rowMap.has(childKey))
            throw new Error("child key is not unique");
        const parentRowAndDepth = this.#rowMap.get(parentKey);
        if (!parentRowAndDepth)
            throw new Error("no parent row found!");
        const newRow = new this.#RowBuilder(...rowArguments);
        const [parentDepth, parentRow] = parentRowAndDepth;
        const depth = parentDepth + 1;
        if (depth % 2 === 0) {
            newRow.classList.add("depth-even");
        }
        else {
            newRow.classList.add("depth-odd");
        }
        this.#rowMap.set(childKey, [depth, newRow]);
        parentRow.addRow(newRow);
        return newRow;
    }
    removeRow(key) {
        if (key === "")
            throw new Error("You cannot remove the root!");
        const existingRowAndDepth = this.#rowMap.get(key);
        if (!existingRowAndDepth)
            throw new Error("No row found for key " + key);
        existingRowAndDepth[1].remove();
        this.#rowMap.delete(key);
    }
}
window.customElements.define("tree-grid", TreeGridElement);
