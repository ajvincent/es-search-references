import * as CodeMirror from "../../../lib/packages/CodeMirror.mjs";

export class CodeMirrorElement extends HTMLElement {
  readonly #shadowRoot: DocumentFragment;
  readonly editorView: CodeMirror.EditorView;

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({mode: "closed"});
    this.editorView = new CodeMirror.EditorView({
      extensions: [CodeMirror.basicSetup, CodeMirror.javascript()],
      parent: this.#shadowRoot
    });
  }
}
customElements.define("codemirror-editor", CodeMirrorElement);
