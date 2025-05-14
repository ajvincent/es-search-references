import { TabPanelsView } from "../../tab-panels/tab-panels-view.js";
import { EditorPanelView } from "./EditorView.js";
export class FileEditorMapView {
    #fileMap;
    #panelsView;
    #editorPanelViews = new Map;
    panelSetId;
    displayElement;
    constructor(fileMap, panelSetId, parentElement) {
        this.#fileMap = fileMap;
        this.panelSetId = panelSetId;
        this.displayElement = document.createElement("tab-panels");
        this.displayElement.id = panelSetId;
        parentElement.append(this.displayElement);
        this.#panelsView = new TabPanelsView(panelSetId);
        const keys = Array.from(this.#fileMap.keys());
        keys.sort();
        for (const filePath of keys) {
            const contents = this.#fileMap.get(filePath);
            this.addEditorForPath(filePath, contents);
        }
    }
    addEditorForPath(filePath, contents) {
        if (!this.displayElement) {
            throw new Error("no parent element for editor, call this.createEditors() first!");
        }
        if (this.#editorPanelViews.has(filePath)) {
            throw new Error("we already have an editor for " + filePath);
        }
        const editorPanelView = new EditorPanelView(filePath, contents);
        this.displayElement.append(editorPanelView.displayElement);
        this.#editorPanelViews.set(filePath, editorPanelView);
        this.#panelsView.addPanel(filePath, editorPanelView);
    }
    selectFile(filePath) {
        this.#panelsView.activeViewKey = filePath;
    }
    updateFileMap() {
        const unvisited = new Set(this.#fileMap.keys());
        for (const [key, editorView] of this.#editorPanelViews) {
            this.#fileMap.set(key, editorView.getContents());
            unvisited.delete(key);
        }
        for (const key of unvisited) {
            this.#fileMap.delete(key);
        }
    }
}
