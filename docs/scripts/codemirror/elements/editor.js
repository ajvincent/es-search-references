import * as CodeMirror from "../../../lib/packages/CodeMirror.mjs";
export class CodeMirrorElement extends HTMLElement {
    #shadowRoot;
    editorView;
    #docChangedCallback;
    constructor(pathToFile, contents, isReadonly) {
        super();
        this.dataset.pathtofile = pathToFile;
        this.#shadowRoot = this.attachShadow({ mode: "closed" });
        const extensions = [
            CodeMirror.basicSetup,
            CodeMirror.javascript(),
        ];
        if (isReadonly) {
            extensions.push(CodeMirror.EditorView.editable.of(false));
        }
        else {
            const docChangedCallback = (viewUpdate) => {
                if (viewUpdate.docChanged && this.#docChangedCallback)
                    this.#docChangedCallback();
            };
            extensions.push(CodeMirror.EditorView.updateListener.of(docChangedCallback));
        }
        this.editorView = new CodeMirror.EditorView({
            extensions,
            parent: this.#shadowRoot,
            doc: contents,
        });
    }
    getContents() {
        return this.editorView.state.doc.toString();
    }
    scrollToLine(lineNumber) {
        const view = this.editorView;
        const line = view.state.doc.line(lineNumber);
        const effect = CodeMirror.EditorView.scrollIntoView(line.from, { y: "start", x: "start", });
        view.dispatch({
            effects: [effect]
        });
        this.scrollIntoView({ block: "start" });
    }
    setDocChangedCallback(callback) {
        this.#docChangedCallback = callback;
    }
}
customElements.define("codemirror-editor", CodeMirrorElement);
