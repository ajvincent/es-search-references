//#region preamble
import { FileEditorMapView } from "../codemirror/views/FileEditorMapView.js";
import { FileSystemContextMenu } from "./contextMenu.js";
import { FileSystemElement } from "./elements/file-system.js";
import { EditableFileRowView } from "./views/editable-file-row.js";
import { FileRowView } from "./views/file-row.js";
import { DirectoryRowView } from "./views/directory-row.js";
import { FileSystemView } from "./views/file-system.js";
//#endregion preamble
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
    #directoriesSet = new Set;
    constructor(rootId, isReadonly, fileSystemElement, fileMap, codeMirrorPanelsElement) {
        this.displayElement = fileSystemElement;
        this.isReadOnly = isReadonly;
        this.fileMap = fileMap;
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.displayElement.treeRows);
        for (const key of this.fileMap.keys()) {
            this.#addFileKey(key);
        }
        this.editorMapView = new FileEditorMapView(fileMap, rootId, isReadonly, codeMirrorPanelsElement);
        this.#fsContextMenu = new FileSystemContextMenu(this);
        void this.#fsContextMenu;
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
    #addFileKey(key) {
        const view = this.#fileSystemView.addFileKey(key, this.#directoriesSet);
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
    // FileSystemControllerIfc
    startAddFile(pathToDirectory) {
        const parentRowView = this.#fileSystemView.getRowView(pathToDirectory);
        if (parentRowView.rowType !== "directory") {
            throw new Error("row type must be a directory: " + pathToDirectory);
        }
        const newRowView = new EditableFileRowView(parentRowView.depth + 1, false, "");
        parentRowView.prependRow(newRowView);
        newRowView.rowElement.onkeyup = event => this.#handleNewFileNameKeyUp(parentRowView, newRowView, event);
        newRowView.inputElement.onblur = event => parentRowView.removeRow(newRowView);
        newRowView.inputElement.focus();
    }
    #handleNewFileNameKeyUp(parentRowView, newRowView, event) {
        const { key } = event;
        if (key !== "Escape" && key !== "Enter")
            return;
        const localPath = newRowView.inputElement.value;
        parentRowView.removeRow(newRowView);
        if (key === "Escape") {
            return;
        }
        if (!this.#isValidNewFileName(parentRowView.fullPath, localPath, true))
            return;
        const fullPath = parentRowView.fullPath + "/" + localPath;
        this.fileMap.set(fullPath, "");
        this.#addFileKey(fullPath);
        this.editorMapView.addEditorForPath(fullPath);
        this.#fileSystemView.showFile(fullPath);
    }
    #isValidNewFileName(parentPath, localPath, isNewFile) {
        if (localPath === "" || localPath.startsWith("./") || localPath.startsWith("../")) {
            return false;
        }
        if (!isNewFile && localPath.includes("/"))
            return false;
        const fullPath = parentPath + "/" + localPath;
        if (this.#fileSystemView.hasRowView(fullPath))
            return false;
        return true;
    }
}
