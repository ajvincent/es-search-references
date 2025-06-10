//#region preamble
import "../../lib/packages/ctxmenu.js";
import { FileEditorMapView } from "../codemirror/views/FileEditorMapView.js";
import { FileRowView } from "./views/file-row.js";
import { DirectoryRowView } from "./views/directory-row.js";
import { FileSystemView } from "./views/file-system.js";
import { FileSystemElement } from "./elements/file-system.js";
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
    constructor(rootId, isReadonly, fileMap, codeMirrorPanelsElement) {
        this.displayElement = document.getElementById("fss:" + rootId);
        if (!this.displayElement)
            throw new Error("no element for root id: " + rootId);
        this.isReadOnly = isReadonly;
        this.fileMap = fileMap;
        this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.displayElement.treeRows);
        const directoriesSet = new Set;
        for (const key of this.fileMap.keys()) {
            this.#addFileKey(key, directoriesSet);
        }
        this.editorMapView = new FileEditorMapView(fileMap, rootId, isReadonly, codeMirrorPanelsElement);
        this.#createContextMenu();
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
    #createContextMenu() {
        const selector = `[id="${this.displayElement.id}"] > tree-grid > tree-rows `;
        const menuDefinition = [
            { text: "Hello World" },
            /*
            { text: "Copy", action(ev) {
              void(ev);
            }},
            */
        ];
        const config = {
            onBeforeShow: (menu, event) => {
                let target = event.target;
                while (!target.dataset.fullpath) {
                    target = target.parentElement;
                }
                const fullPath = target.dataset.fullpath;
                /*
                (menu[0] as CTXMHeading).text = fullPath;
                */
                return menu;
            },
        };
        window.ctxmenu.attach(selector, menuDefinition, config);
    }
}
