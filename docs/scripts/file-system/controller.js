import { FileEditorMapView } from "../codemirror/views/FileEditorMapView.js";
import { FileSystemContextMenu } from "./contextMenu.js";
import { FileSystemElement } from "./elements/file-system.js";
import { FileRowView } from "./views/file-row.js";
import { DirectoryRowView } from "./views/directory-row.js";
import { FileSystemView } from "./views/file-system.js";
void (FileSystemElement); // force the custom element upgrade
export class FileSystemController {
    isReadOnly;
    displayElement;
    fileMap;
    #filesCheckedSet = new Set;
    filesCheckedSet = this.#filesCheckedSet;
    #fileToRowMap = new Map;
    #fileSystemView;
    editorMapView;
    #fsContextMenu;
    constructor(rootId, isReadonly, fileSystemElement, fileMap, codeMirrorPanelsElement) {
        this.displayElement = fileSystemElement;
        this.isReadOnly = isReadonly;
        this.fileMap = fileMap;
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.displayElement.treeRows);
        const directoriesSet = new Set;
        for (const key of this.fileMap.keys()) {
            this.#addFileKey(key, directoriesSet);
        }
        this.editorMapView = new FileEditorMapView(fileMap, rootId, isReadonly, codeMirrorPanelsElement);
        this.#fsContextMenu = new FileSystemContextMenu(this);
    }
    dispose() {
        this.displayElement.remove();
        this.#fileToRowMap.clear();
        this.#fileSystemView.clearRowMap();
        this.editorMapView.dispose();
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
            this.editorMapView.selectFile(key);
        };
        view.rowElement.onclick = (ev) => {
            ev.stopPropagation();
        };
    }
    showFileAndLineNumber(specifier, lineNumber) {
        this.#fileSystemView.showFile(specifier);
        this.editorMapView.scrollToLine(lineNumber);
    }
    updateFileMap() {
        this.editorMapView.updateFileMap();
    }
    // FileSystemControllerIfc
    getTreeRowsElement() {
        return this.displayElement.treeRows;
    }
    // FileSystemControllerIfc
    get clipBoardHasCopy() {
        return false;
    }
}
