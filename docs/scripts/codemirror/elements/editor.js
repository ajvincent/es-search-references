import * as CodeMirror from "../../../lib/packages/CodeMirror.mjs";
export class CodeMirrorElement extends HTMLElement {
    #shadowRoot;
    editorView;
    constructor(pathToFile, contents) {
        super();
        this.dataset.pathtofile = pathToFile;
        this.#shadowRoot = this.attachShadow({ mode: "closed" });
        this.editorView = new CodeMirror.EditorView({
            extensions: [CodeMirror.basicSetup, CodeMirror.javascript()],
            parent: this.#shadowRoot,
            doc: contents,
        });
    }
    getContents() {
        return this.editorView.state.doc.toString();
    }
}
customElements.define("codemirror-editor", CodeMirrorElement);
