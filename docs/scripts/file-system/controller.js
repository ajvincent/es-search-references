//#region preamble
import { FileEditorMapView } from "../codemirror/views/FileEditorMapView.js";
import { FileSystemContextMenu } from "./contextMenu.js";
import { FileSystemElement } from "./elements/file-system.js";
import { FileRowView } from "./views/file-row.js";
import { DirectoryRowView } from "./views/directory-row.js";
import { FileSystemView } from "./views/file-system.js";
//#endregion preamble
void (FileSystemElement); // force the custom element upgrade
export class FileSystemController {
    static async build(rootId, isReadonly, fileSystemElement, codeMirrorPanelsElement, webFS) {
        const index = await webFS.getIndex();
        return new FileSystemController(rootId, isReadonly, fileSystemElement, codeMirrorPanelsElement, webFS, index);
    }
    isReadOnly;
    displayElement;
    #webFS;
    #filesCheckedSet = new Set;
    filesCheckedSet = this.#filesCheckedSet;
    #fileToRowMap = new Map;
    #fileSystemView;
    editorMapView;
    #fsContextMenu;
    constructor(rootId, isReadonly, fileSystemElement, codeMirrorPanelsElement, webFS, index) {
        this.displayElement = fileSystemElement;
        this.isReadOnly = isReadonly;
        this.#webFS = webFS;
        this.#fsContextMenu = new FileSystemContextMenu(this);
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.displayElement.treeRows, index, undefined, this);
        for (const [fullPath, fileView] of this.#fileSystemView.descendantFileViews()) {
            this.#addFileEventHandlers(fullPath, fileView);
        }
        this.editorMapView = new FileEditorMapView(rootId, isReadonly, codeMirrorPanelsElement, webFS);
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
    #addFileEventHandlers(fullPath, view) {
        this.#fileToRowMap.set(fullPath, view);
        view.checkboxElement.onclick = (ev) => {
            this.#fileCheckToggled(fullPath, view.checkboxElement.checked);
        };
        view.radioElement.onclick = (ev) => {
            this.#selectFile(fullPath, ev);
        };
        view.rowElement.onclick = (ev) => {
            ev.stopPropagation();
        };
    }
    async #selectFile(fullPath, event) {
        if (event) {
            event.stopPropagation();
        }
        await this.editorMapView.updateSelectedFile();
        if (!this.editorMapView.hasEditorForPath(fullPath)) {
            await this.editorMapView.addEditorForPath(fullPath);
        }
        this.editorMapView.selectFile(fullPath);
    }
    async getWebFilesMap() {
        const record = await this.#webFS.getWebFilesRecord();
        return new Map(Object.entries(record));
    }
    getWebFilesIndex() {
        return this.#webFS.getIndex();
    }
    showFileAndLineNumber(specifier, lineNumber) {
        this.#fileSystemView.showFile(specifier);
        this.editorMapView.scrollToLine(lineNumber);
    }
    async updateSelectedFile() {
        return this.editorMapView.updateSelectedFile();
    }
    // FileSystemControllerIfc
    getTreeRowsElement() {
        return this.displayElement.treeRows;
    }
    // FileSystemControllerIfc
    get clipBoardHasCopy() {
        return false;
    }
    async showFSContextMenu(event, pathToFile, isDirectory) {
        event.stopPropagation();
        this.#fsContextMenu.show(event, pathToFile, isDirectory);
    }
    // FileSystemControllerIfc
    async startAddFile(pathToDirectory) {
        /*
        const parentRowView = this.#fileSystemView.getRowView(pathToDirectory);
        if (parentRowView.rowType !== "directory") {
          throw new Error("row type must be a directory: " + pathToDirectory);
        }
    
        const newRowView = new FileRowView(parentRowView.depth + 1, false, "", parentRowView + "/");
        parentRowView.prependRow(newRowView);
    
        let { promise, resolve } = Promise.withResolvers<string | null>();
        promise = promise.finally(() => parentRowView.removeRow(newRowView));
        const localPath: string | null = await newRowView.editLabel(promise);
    
        if (!localPath) {
          resolve(null);
          return;
        }
    
        if (!this.#isValidNewFileName(parentRowView.fullPath, localPath, true)) {
          resolve(null);
          return;
        }
    
        const fullPath = parentRowView.fullPath + "/" + localPath;
    
        this.fileMap.set(fullPath, "");
        this.#addFileKey(fullPath);
        await this.editorMapView.addEditorForPath(fullPath);
    
        this.#fileSystemView.showFile(fullPath);
        resolve(null);
        */
        return Promise.reject(new Error("this is being rewritten"));
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
