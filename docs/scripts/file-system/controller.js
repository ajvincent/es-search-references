import { FileRowView } from "./views/file-row.js";
import { DirectoryRowView } from "./views/directory-row.js";
import { FileSystemView } from "./views/file-system.js";
import { FileSystemElement } from "./elements/file-system.js";
void (FileSystemElement); // force the custom element upgrade
export class FileSystemController {
    isReadOnly;
    displayElement;
    #fileMap = new Map;
    #callbacks;
    #fileToRowMap = new Map;
    #fileSystemView;
    constructor(rootId, isReadonly, callbacks) {
        this.displayElement = document.getElementById(rootId);
        this.isReadOnly = isReadonly;
        this.#callbacks = callbacks;
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.displayElement.treeRows);
    }
    getFileMap() {
        return this.#fileMap;
    }
    setFileMap(fileMap) {
        this.#fileToRowMap.clear();
        this.displayElement.treeRows.replaceChildren();
        const fileEntries = Array.from(fileMap.entries());
        fileEntries.sort((a, b) => a[0].localeCompare(b[0]));
        this.#fileMap = new Map(fileEntries);
        const directoriesSet = new Set;
        for (const key of this.#fileMap.keys()) {
            this.#addFileKey(key, directoriesSet);
        }
    }
    #addFileKey(key, directoriesSet) {
        const view = this.#fileSystemView.addFileKey(key, directoriesSet);
        this.#fileToRowMap.set(key, view);
        view.checkboxElement.onclick = (ev) => {
            this.#callbacks.fileCheckToggled(this, key, view.checkboxElement.checked);
        };
        view.radioElement.onclick = (ev) => {
            this.#callbacks.fileSelected(this, key);
        };
        view.rowElement.onclick = (ev) => {
            ev.stopPropagation();
        };
    }
}
