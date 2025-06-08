import { TreeRowView } from "../../tree/views/tree-row.js";
export class SearchKeyRowView extends TreeRowView {
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
}
