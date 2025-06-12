import { TreeRowView } from "../../tree/views/tree-row.js";
export class BaseFileRowView extends TreeRowView {
    fullPath;
    rowType = "file";
    constructor(depth, isCollapsible, label, fullPath) {
        super(depth, isCollapsible, label);
        this.fullPath = fullPath;
        this.rowElement.dataset.fullpath = fullPath;
        this.addCells();
    }
    getCellElements() {
        return [
            this.buildPrimaryLabelElement(),
        ];
    }
    registerCollapseClick() {
        this.rowElement.onclick = this.#toggleCollapsed.bind(this);
    }
    #toggleCollapsed(event) {
        event.preventDefault();
        event.stopPropagation();
        this.rowElement.toggleCollapsed();
    }
    selectFile(key) {
        throw new Error("not implemented");
    }
}
