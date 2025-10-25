import { TreeRowView } from "../../tree/views/tree-row.js";
export class BaseDirectoryRowView extends TreeRowView {
    rowType = "directory";
    fullPath;
    constructor(depth, primaryLabel, fullPath, fsControllerCallbacks) {
        super(depth, depth > 0, primaryLabel);
        this.fullPath = fullPath;
        this.rowElement.dataset.fullpath = fullPath;
        this.rowElement.dataset.isdirectory = "true";
        if (fsControllerCallbacks) {
            this.rowElement.addEventListener("contextmenu", event => fsControllerCallbacks.showFSContextMenu(event, fullPath, true));
        }
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
}
