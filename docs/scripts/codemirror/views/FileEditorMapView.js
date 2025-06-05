import { TabPanelsView } from "../../tab-panels/tab-panels-view.js";
import { EditorPanelView } from "./EditorView.js";
export class FileEditorMapView {
    #fileMap;
    #panelsView;
    panelSetId;
    displayElement;
    #isReadonly;
    constructor(fileMap, panelSetId, isReadonly, parentElement) {
        this.#fileMap = fileMap;
        this.#isReadonly = isReadonly;
        this.panelSetId = panelSetId;
        this.displayElement = document.createElement("tab-panels");
        this.displayElement.id = panelSetId;
        parentElement.append(this.displayElement);
        this.#panelsView = new TabPanelsView(panelSetId);
        for (const filePath of this.#fileMap.keys()) {
            const contents = this.#fileMap.get(filePath);
            this.addEditorForPath(filePath, contents);
        }
    }
    addEditorForPath(filePath, contents) {
        if (!this.displayElement) {
            throw new Error("no parent element for editor, call this.createEditors() first!");
        }
        if (this.#panelsView.hasPanel(filePath)) {
            throw new Error("we already have an editor for " + filePath);
        }
        const editorPanelView = new EditorPanelView(filePath, contents, this.#isReadonly);
        this.displayElement.append(editorPanelView.displayElement);
        this.#panelsView.addPanel(filePath, editorPanelView);
    }
    selectFile(filePath) {
        this.#panelsView.activeViewKey = filePath;
    }
    scrollToLine(lineNumber) {
        this.#panelsView.currentPanel.scrollToLine(lineNumber);
    }
    updateFileMap() {
        this.#fileMap.batchUpdate(() => {
            const unvisited = new Set(this.#fileMap.keys());
            for (const [key, editorView] of this.#panelsView.entries()) {
                this.#fileMap.set(key, editorView.getContents());
                unvisited.delete(key);
            }
            for (const key of unvisited) {
                this.#fileMap.delete(key);
            }
        });
    }
}
