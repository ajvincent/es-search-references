import { BaseFileEntryRowView } from "./base-file-entry-row.js";
export class BaseFileRowView extends BaseFileEntryRowView {
    rowType = "file";
    constructor(depth, isCollapsible, label, fullPath, fsControllerCallbacks) {
        super(depth, isCollapsible, label, fullPath, fsControllerCallbacks, false);
    }
    clone() {
        return new BaseFileRowView(this.depth, this.isCollapsible, this.primaryLabel, this.fullPath, this.fsControllerCallbacks);
    }
    selectFile() {
        throw new Error("not implemented");
    }
}
