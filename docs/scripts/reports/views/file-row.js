import { TreeRowView } from "../../tree/views/tree-row.js";
export class ReportFileRowView extends TreeRowView {
    constructor(fullPath) {
        super(0, true, fullPath);
        this.initialize();
        this.rowElement.onclick = this.#toggleCollapsed.bind(this);
    }
    getCellElements() {
        return [
            this.buildPrimaryLabelElement(),
        ];
    }
    #toggleCollapsed(event) {
        event.preventDefault();
        event.stopPropagation();
        this.rowElement.toggleCollapsed();
    }
}
