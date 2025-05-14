import { FileEditorMapView } from "../codemirror/views/FileMapView.js";
import { FileRowView } from "./views/file-row.js";
import { DirectoryRowView } from "./views/directory-row.js";
import { FileSystemView } from "./views/file-system.js";
import { FileSystemElement } from "./elements/file-system.js";
void (FileSystemElement); // force the custom element upgrade
export class FileSystemController {
    isReadOnly;
    displayElement;
    fileMap;
    #filesCheckedSet = new Set;
    filesCheckedSet = this.#filesCheckedSet;
    #fileToRowMap = new Map;
    #fileSystemView;
    referenceFileMapView;
    constructor(rootId, isReadonly, fileMap, codeMirrorPanelsElement) {
        this.displayElement = document.getElementById("fss:" + rootId);
        if (!this.displayElement)
            throw new Error("no element for root id: " + rootId);
        this.isReadOnly = isReadonly;
        const fileEntries = Array.from(fileMap.entries());
        fileEntries.sort((a, b) => a[0].localeCompare(b[0]));
        this.fileMap = new Map(fileEntries);
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.displayElement.treeRows);
        const directoriesSet = new Set;
        for (const key of this.fileMap.keys()) {
            this.#addFileKey(key, directoriesSet);
        }
        this.referenceFileMapView = new FileEditorMapView(fileMap, rootId, codeMirrorPanelsElement);
    }
    #fileCheckToggled(pathToFile, isChecked) {
        if (isChecked)
            this.#filesCheckedSet.add(pathToFile);
        else
            this.#filesCheckedSet.delete(pathToFile);
    }
    #addFileKey(key, directoriesSet) {
        const view = this.#fileSystemView.addFileKey(key, directoriesSet);
        this.#fileToRowMap.set(key, view);
        view.checkboxElement.onclick = (ev) => {
            this.#fileCheckToggled(key, view.checkboxElement.checked);
        };
        view.radioElement.onclick = (ev) => {
            this.referenceFileMapView.selectFile(key);
        };
        view.rowElement.onclick = (ev) => {
            ev.stopPropagation();
        };
    }
}
