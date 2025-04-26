import { BaseDirectoryRowView } from "./base-directory-row.js";
export class DirectoryRowView extends BaseDirectoryRowView {
    getCellElements() {
        return [
            document.createElement("span"),
            this.buildPrimaryLabelElement(),
            document.createElement("span"),
        ];
    }
}
