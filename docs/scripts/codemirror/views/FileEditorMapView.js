import { TabPanelsView } from "../../tab-panels/tab-panels-view.js";
import { EditorPanelView } from "./EditorPanelView.js";
export class FileEditorMapView {
    #panelsView;
    #webFS;
    displayElement;
    #isReadonly;
    #fileModifiedCallback;
    constructor(panelSetId, isReadonly, parentElement, webFS, fileModifiedCallback) {
        this.#isReadonly = isReadonly;
        this.displayElement = document.createElement("tab-panels");
        this.displayElement.id = panelSetId;
        parentElement.append(this.displayElement);
        this.#panelsView = new TabPanelsView(panelSetId);
        this.#webFS = webFS;
        this.#fileModifiedCallback = fileModifiedCallback;
    }
    dispose() {
        this.displayElement.remove();
        this.#panelsView.dispose();
    }
    hasEditorForPath(filePath) {
        return this.#panelsView.hasPanel(filePath);
    }
    async addEditorForPath(filePath, forceReadonly) {
        if (this.#panelsView.hasPanel(filePath)) {
            throw new Error("we already have an editor for " + filePath);
        }
        let contents;
        if (filePath.startsWith("(clipboard)/"))
            contents = await this.#webFS.readClipboardFile(filePath.substring(12));
        else
            contents = await this.#webFS.readFileDeep(filePath);
        if (contents === undefined) {
            throw new Error("unknown file path: " + filePath);
        }
        const editorPanelView = new EditorPanelView(filePath, contents, this.#isReadonly || forceReadonly);
        if (this.#fileModifiedCallback) {
            editorPanelView.setDocChangedCallback(() => this.#fileModifiedCallback(filePath));
        }
        this.displayElement.append(editorPanelView.displayElement);
        this.#panelsView.addPanel(filePath, editorPanelView);
    }
    getContentsFromEditor(filePath) {
        return this.#panelsView.getPanel(filePath)?.getContents();
    }
    selectFile(filePath) {
        this.#panelsView.activeViewKey = filePath;
    }
    scrollToLine(lineNumber) {
        this.#panelsView.currentPanel.scrollToLine(lineNumber);
    }
    clearPanels() {
        this.#panelsView.clearPanels();
    }
}
