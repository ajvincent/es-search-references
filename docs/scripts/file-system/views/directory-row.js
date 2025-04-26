import { TreeRowView } from "../../tree/views/tree-row.js";
export class DirectoryRowView extends TreeRowView {
    constructor(depth, primaryLabel) {
        super(depth, true, primaryLabel);
        this.initialize();
    }
    getCellElements() {
        return [
            document.createElement("span"),
            this.buildPrimaryLabelElement(),
            document.createElement("span"),
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
