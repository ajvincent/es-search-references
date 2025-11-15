import { FileSystemMap } from "./FileSystemMap.js";
import { DirectoryRowView } from "./views/directory-row.js";
import { FileRowView } from "./views/file-row.js";
import { FileSystemView } from "./views/file-system.js";
export class ClipboardController {
    static rowName = "(clipboard)";
    #fileSystemElement;
    #webFS;
    #clipboardHasCopy;
    fileToRowMap;
    #fileSystemView;
    constructor(fileSystemElement, webFS) {
        this.#fileSystemElement = fileSystemElement;
        this.#webFS = webFS;
        this.#clipboardHasCopy = false;
        const fileToRowMap = new FileSystemMap(0);
        this.fileToRowMap = fileToRowMap;
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.#fileSystemElement.treeRows, { [ClipboardController.rowName]: {} }, fileToRowMap);
        this.clipboardRow.rowElement.classList.add("clipboard-row");
    }
    get fileSystemView() {
        return this.#fileSystemView;
    }
    async rebuild() {
        this.#fileSystemView.clearRowMap();
        const index = await this.#webFS.getClipboardIndex();
        this.#clipboardHasCopy = Object.entries(index).length > 0;
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.#fileSystemElement.treeRows, { [ClipboardController.rowName]: index }, this.fileToRowMap);
        this.clipboardRow.rowElement.addEventListener("contextmenu", ev => this.#showContextMenu(ev));
    }
    get clipboardRow() {
        return this.#fileSystemView.getRowView(ClipboardController.rowName);
    }
    get clipboardHasCopy() {
        return this.#clipboardHasCopy;
    }
    #showContextMenu(ev) {
        this.#clearItem.disabled = !this.#clipboardHasCopy;
        window.ctxmenu.show([this.#clearItem], ev);
    }
    #clearItem = {
        text: "Clear Clipboard",
        disabled: true,
        action: async (ev) => {
            await this.#webFS.clearClipboard();
            await this.rebuild();
        }
    };
}
