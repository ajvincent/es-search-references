export class FileSystemElement extends HTMLElement {
  static readonly #template: DocumentFragment = (document.getElementById("shadow-filesystem-base") as HTMLTemplateElement).content;
  #shadowRoot?: ShadowRoot;

  public treeRows: HTMLElement | null = null;

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    this.#shadowRoot.append(FileSystemElement.#template.cloneNode(true));
    this.treeRows = this.#shadowRoot.getElementById("tree-rows")!;
  }
}

customElements.define("file-system", FileSystemElement);
