import { BaseFileEntryRowView } from "./base-file-entry-row.js";
export class BaseDirectoryRowView extends BaseFileEntryRowView {
    rowType = "directory";
    constructor(depth, primaryLabel, fullPath, fsControllerCallbacks) {
        super(depth, depth > 0, primaryLabel, fullPath, fsControllerCallbacks, true);
    }
    clone() {
        return new BaseDirectoryRowView(this.depth, this.primaryLabel, this.fullPath, this.fsControllerCallbacks);
    }
}
