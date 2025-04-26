import { TreeRowView } from "../../tree/views/tree-row.js";
export class BaseDirectoryRowView extends TreeRowView {
    constructor(depth, primaryLabel) {
        super(depth, depth > 0, primaryLabel);
        this.initialize();
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
