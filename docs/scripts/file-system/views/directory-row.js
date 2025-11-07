import { BaseDirectoryRowView } from "./base-directory-row.js";
export class DirectoryRowView extends BaseDirectoryRowView {
    clone() {
        return new DirectoryRowView(this.depth, this.primaryLabel, this.fullPath, this.fsControllerCallbacks);
    }
    getCellElements() {
        return [
            document.createElement("span"),
            this.buildPrimaryLabelElement(),
            document.createElement("span"),
        ];
    }
}
