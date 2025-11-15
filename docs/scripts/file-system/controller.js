//#region preamble
import { FileEditorMapView } from "../codemirror/views/FileEditorMapView.js";
import { ClipboardController } from "./clipboardController.js";
import { FileSystemMap, } from "./FileSystemMap.js";
import { FileSystemContextMenu } from "./contextMenu.js";
import { FSContextMenuShowArguments } from "./contextMenuShowArguments.js";
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
    #fileToRowMap;
    #fileSystemView;
    #clipboardController;
    editorMapView;
    #fsContextMenu;
    constructor(rootId, isReadonly, fileSystemElement, codeMirrorPanelsElement, webFS, index) {
        this.displayElement = fileSystemElement;
        this.isReadOnly = isReadonly;
        this.#webFS = webFS;
        this.#fsContextMenu = new FileSystemContextMenu(this);
        const fileToRowMap = new FileSystemMap(0);
        this.#fileToRowMap = fileToRowMap;
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.displayElement.treeRows, index, fileToRowMap, undefined, this);
        for (const [fullPath, fileView] of this.#fileSystemView.descendantFileViews()) {
            this.#addFileEventHandlers(fullPath, fileView);
        }
        this.#clipboardController = new ClipboardController(fileSystemElement, webFS);
        this.editorMapView = new FileEditorMapView(rootId, isReadonly, codeMirrorPanelsElement, webFS);
    }
    dispose() {
        this.displayElement.remove();
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
            const forceReadonly = fullPath.startsWith(ClipboardController.rowName);
            await this.editorMapView.addEditorForPath(fullPath, forceReadonly);
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
        return this.#clipboardController.clipboardHasCopy;
    }
    // FileSystemControllerIfc
    async showFSContextMenu(event, pathToFile, isDirectory) {
        event.stopPropagation();
        event.preventDefault();
        const showArgsPromise = new FSContextMenuShowArguments(event, pathToFile, isDirectory, this.#webFS);
        const showArgs = await showArgsPromise.promise;
        this.#fsContextMenu.show(showArgs);
    }
    // FileSystemControllerIfc
    async addNewFile(currentDirectory, leafName, isDirectory) {
        let pathToFile = currentDirectory;
        if (currentDirectory.endsWith("://") === false)
            pathToFile += "/";
        pathToFile += leafName;
        if (isDirectory) {
            await this.#webFS.createDirDeep(pathToFile);
        }
        else {
            await this.#webFS.writeFileDeep(pathToFile, "");
        }
        const newRowView = this.#fileSystemView.addNewFile(currentDirectory, leafName, isDirectory);
        if (newRowView instanceof FileRowView) {
            this.#addFileEventHandlers(pathToFile, newRowView);
        }
        this.#fileSystemView.showFile(pathToFile);
    }
    // FileSystemControllerIfc
    async addPackage(packageName) {
        await this.#webFS.createDirDeep(packageName);
        this.#fileSystemView.addNewPackage(packageName);
    }
    // FileSystemControllerIfc
    async addProtocol(protocolName) {
        await this.#webFS.createDirDeep(protocolName);
        this.#fileSystemView.addNewProtocol(protocolName);
    }
    // FileSystemControllerIfc
    async deleteFile(pathToFile) {
        await this.#webFS.removeEntryDeep(pathToFile);
        this.#fileSystemView.deleteFile(pathToFile);
        this.editorMapView.clearPanels();
    }
    // FileSystemControllerIfc
    async renameFile(currentPathToFile, newLeafName) {
        const parentPath = FileSystemMap.getParentPath(currentPathToFile);
        const oldLeafName = currentPathToFile.substring(parentPath.length + 1);
        await this.#webFS.copyEntryDeep(parentPath, oldLeafName, newLeafName);
        await this.#webFS.removeEntryDeep(currentPathToFile);
        this.#fileSystemView.renameFile(parentPath, oldLeafName, newLeafName);
        this.editorMapView.clearPanels();
    }
    // FileSystemControllerIfc
    async copyToClipboard(pathToFile, isCut) {
        await this.#webFS.copyToClipboard(pathToFile);
        if (isCut) {
            await this.#webFS.removeEntryDeep(pathToFile);
            this.#fileSystemView.deleteFile(pathToFile);
        }
        await this.rebuildClipboard();
        this.editorMapView.clearPanels();
    }
    async rebuildClipboard() {
        await this.#clipboardController.rebuild();
        const iterator = this.#clipboardController.fileSystemView.descendantFileViews();
        for (const [fullPath, fileView] of iterator) {
            this.#addFileEventHandlers(fullPath, fileView);
        }
    }
    async copyFromClipboard(currentDirectory, leafName, isDirectory) {
        await this.#webFS.copyFromClipboard(currentDirectory);
        let pathToFile = currentDirectory;
        if (currentDirectory.endsWith("://") === false)
            pathToFile += "/";
        pathToFile += leafName;
        let newRecord = null;
        if (isDirectory)
            newRecord = await this.#webFS.getDescendantIndex(pathToFile);
        this.#fileToRowMap.copyFrom(this.#clipboardController.fileToRowMap, leafName, currentDirectory, leafName);
        this.#fileSystemView.addExistingFileEntries(currentDirectory, leafName, newRecord);
    }
}
