import { FileSystemMap } from "./FileSystemMap.js";
import { DirectoryRowView } from "./views/directory-row.js";
import { FileRowView } from "./views/file-row.js";
import { FileSystemView } from "./views/file-system.js";
export class ClipboardController {
    static rowName = "(clipboard)";
    #fileSystemElement;
    #webFS;
    #fileToRowMap;
    #fileSystemView;
    constructor(fileSystemElement, webFS) {
        this.#fileSystemElement = fileSystemElement;
        this.#webFS = webFS;
        const fileToRowMap = new FileSystemMap(0);
        this.#fileToRowMap = fileToRowMap;
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.#fileSystemElement.treeRows, { [ClipboardController.rowName]: {} }, fileToRowMap);
        this.clipboardRow.rowElement.classList.add("clipboard-row");
    }
    get fileSystemView() {
        return this.#fileSystemView;
    }
    async rebuild() {
        this.#fileSystemView.clearRowMap();
        const index = await this.#webFS.getClipboardIndex();
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.#fileSystemElement.treeRows, { [ClipboardController.rowName]: index }, this.#fileToRowMap);
    }
    get clipboardRow() {
        return this.#fileSystemView.getRowView(ClipboardController.rowName);
    }
}
