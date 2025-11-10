import { CodeMirrorElement } from "../elements/editor.js";
export class EditorPanelView {
    displayElement;
    constructor(pathToFile, contents, isReadonly) {
        this.displayElement = new CodeMirrorElement(pathToFile, contents, isReadonly);
    }
    dispose() {
        this.displayElement.remove();
    }
    getContents() {
        return this.displayElement.getContents();
    }
    scrollToLine(lineNumber) {
        this.displayElement.scrollToLine(lineNumber);
    }
}
