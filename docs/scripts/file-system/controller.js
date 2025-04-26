var _a;
import { FileRowView } from "./views/file-row.js";
import { DirectoryRowView } from "./views/directory-row.js";
import { FileSystemElement } from "./elements/file-system.js";
class RowMetadata {
    view;
    constructor(view) {
        this.view = view;
    }
}
void (FileSystemElement); // force the custom element upgrade
export class FileSystemController {
    static #getParentAndLeaf(key) {
        let lastSlash = key.lastIndexOf("/");
        if (lastSlash === -1) {
            return ["", key];
        }
        const parent = key.substring(0, lastSlash);
        const leaf = key.substring(lastSlash + 1);
        return [parent, leaf];
    }
    #isReadOnly;
    #rootElement;
    #fileMap = new Map;
    #callbacks;
    #fileToRowMap = new Map;
    constructor(id, isReadonly, callbacks) {
        this.#rootElement = document.getElementById(id);
        this.#isReadOnly = isReadonly;
        this.#callbacks = callbacks;
    }
    setFileMap(fileMap) {
        this.#fileToRowMap.clear();
        this.#rootElement.treeRows.replaceChildren();
        const fileEntries = Array.from(fileMap.entries());
        fileEntries.sort((a, b) => a[0].localeCompare(b[0]));
        this.#fileMap = new Map(fileEntries);
        const directoriesSet = new Set;
        for (const key of this.#fileMap.keys()) {
            this.#addFileKey(key, directoriesSet);
        }
    }
    #addFileKey(key, directoriesSet) {
        const [parent, leaf] = _a.#getParentAndLeaf(key);
        if (parent && directoriesSet.has(parent) === false) {
            this.#addDirectoryKey(parent, directoriesSet);
        }
        const parentRowData = this.#fileToRowMap.get(parent);
        const view = new FileRowView(parentRowData.view.depth + 1, leaf, key);
        const rowData = new RowMetadata(view);
        this.#fileToRowMap.set(key, rowData);
        view.checkboxElement.onclick = (ev) => {
            this.#callbacks.fileCheckToggled(key, view.checkboxElement.checked);
        };
        view.radioElement.onclick = (ev) => {
            this.#callbacks.fileSelected(key);
        };
        view.rowElement.onclick = (ev) => {
            ev.stopPropagation();
        };
        this.#fileToRowMap.get(parent).view.addRow(view);
    }
    #addDirectoryKey(key, directoriesSet) {
        let [parent, leaf] = _a.#getParentAndLeaf(key);
        if (parent && directoriesSet.has(parent) === false) {
            this.#addDirectoryKey(parent, directoriesSet);
        }
        let depth;
        if (parent === "") {
            depth = 0;
            leaf = "virtual://";
        }
        else {
            depth = this.#fileToRowMap.get(parent).view.depth + 1;
        }
        const view = new DirectoryRowView(depth, leaf);
        const rowData = new RowMetadata(view);
        this.#fileToRowMap.set(key, rowData);
        if (depth > 0) {
            view.registerCollapseClick();
            this.#fileToRowMap.get(parent).view.addRow(view);
        }
        else {
            this.#rootElement.treeRows.append(view.rowElement);
        }
        directoriesSet.add(key);
    }
}
_a = FileSystemController;
