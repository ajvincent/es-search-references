import { TabPanelsView } from "../../tab-panels/tab-panels-view.js";
import { EditorPanelView } from "./EditorView.js";
export class FileEditorMapView {
    #panelsView;
    #webFS;
    displayElement;
    #isReadonly;
    constructor(panelSetId, isReadonly, parentElement, webFS) {
        this.#isReadonly = isReadonly;
        this.displayElement = document.createElement("tab-panels");
        this.displayElement.id = panelSetId;
        parentElement.append(this.displayElement);
        this.#panelsView = new TabPanelsView(panelSetId);
        this.#webFS = webFS;
    }
    dispose() {
        this.displayElement.remove();
        this.#panelsView.dispose();
    }
    hasEditorForPath(filePath) {
        return this.#panelsView.hasPanel(filePath);
    }
    async addEditorForPath(filePath) {
        if (this.#panelsView.hasPanel(filePath)) {
            throw new Error("we already have an editor for " + filePath);
        }
        const contents = await this.#webFS.readFileDeep(filePath);
        if (contents === undefined) {
            throw new Error("unknown file path: " + filePath);
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
}
