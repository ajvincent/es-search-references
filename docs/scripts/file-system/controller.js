import { FileSystemElement, } from "./views/file-system.js";
void (FileSystemElement); // force the import
export class FileSystemController {
    #fileMap = new Map;
    #callbacks;
    #view;
    #fileToRowMap = new Map;
    constructor(id, callbacks) {
        this.#view = document.getElementById(id);
        this.#callbacks = callbacks;
    }
    setFileMap(fileMap) {
        this.#view.clearRows();
        this.#fileToRowMap.clear();
        this.#fileMap = fileMap;
        const directoriesSet = new Set;
        for (const key of this.#fileMap.keys()) {
            this.#addFileKey(key, directoriesSet);
        }
    }
    #addFileKey(key, directoriesSet) {
        const lastSlash = key.lastIndexOf("/");
        const parent = key.substring(0, lastSlash);
        if (parent && directoriesSet.has(parent) === false) {
            this.#addDirectoryKey(parent, directoriesSet);
        }
        const leaf = key.substring(lastSlash + 1);
        const row = this.#view.addRow(parent, leaf, [leaf, key]);
        this.#fileToRowMap.set(key, row);
        row.checkboxElement.onclick = (ev) => {
            ev.stopPropagation();
            this.#callbacks.fileCheckToggled(key, row.checkboxElement.checked);
        };
        row.radioElement.onselect = (ev) => {
            ev.stopPropagation();
            this.#callbacks.fileSelected(key);
        };
    }
    #addDirectoryKey(key, directoriesSet) {
        let lastSlash = key.lastIndexOf("/");
        if (lastSlash === -1)
            lastSlash = 0;
        const parent = key.substring(0, lastSlash);
        if (parent && directoriesSet.has(parent) === false) {
            this.#addDirectoryKey(parent, directoriesSet);
        }
        const leaf = key.substring(lastSlash + 1);
        const row = this.#view.addRow(parent, leaf, [leaf]);
        row.onclick = () => row.toggleCollapsed();
    }
}
