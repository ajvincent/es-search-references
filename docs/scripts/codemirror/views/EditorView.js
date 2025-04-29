import { CodeMirrorElement } from "../elements/editor.js";
export class EditorPanelView {
    displayElement;
    constructor(pathToFile, contents) {
        this.displayElement = new CodeMirrorElement(pathToFile, contents);
    }
    getContents() {
        return this.displayElement.getContents();
    }
}
