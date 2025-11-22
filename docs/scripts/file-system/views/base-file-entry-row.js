import { TreeRowView } from "../../tree/views/tree-row.js";
export class BaseFileEntryRowView extends TreeRowView {
    #depth;
    #fullPath;
    fsControllerCallbacks;
    constructor(depth, isCollapsible, label, fullPath, fsControllerCallbacks, isDirectory) {
        super(depth, isCollapsible, label);
        this.#depth = depth;
        this.#fullPath = fullPath;
        this.rowElement.dataset.fullpath = fullPath;
        this.fsControllerCallbacks = fsControllerCallbacks;
        if (isDirectory)
            this.rowElement.dataset.isdirectory = "true";
        this.addCells();
        if (fsControllerCallbacks) {
            this.rowElement.addEventListener("contextmenu", event => {
                void fsControllerCallbacks.showFSContextMenu(event, this.#fullPath, isDirectory);
            });
        }
    }
    get depth() {
        return this.#depth;
    }
    get fullPath() {
        return this.#fullPath;
    }
    updateFilePathAndDepth(filePathAndDepth) {
        this.#depth = filePathAndDepth.depth;
        this.#fullPath = filePathAndDepth.filePath;
        this.rowElement.dataset.fullpath = filePathAndDepth.filePath;
        const leafName = filePathAndDepth.filePath.substring(filePathAndDepth.filePath.lastIndexOf("/") + 1);
        this.updateLabel(leafName);
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
