import { TreeRowView } from "../../tree/views/tree-row.js";
export class SearchKeyRowView extends TreeRowView {
    rowType = "searchKey";
    constructor(depth, searchKey) {
        super(depth, false, searchKey);
        this.addCells();
        this.rowElement.classList.add("searchkey");
    }
    getCellElements() {
        return [
            this.buildPrimaryLabelElement(),
        ];
    }
    setSelected() {
        this.rowElement.classList.add("selected");
    }
    clearSelected() {
        this.rowElement.classList.remove("selected");
    }
    buildPrimaryLabelElement() {
        const label = super.buildPrimaryLabelElement();
        if (this.primaryLabel === "") {
            const em = document.createElement("em");
            em.append("(script log)");
            label.replaceChildren(em);
        }
        return label;
    }
}
