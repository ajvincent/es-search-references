export class FileSystemElement extends HTMLElement {
  static readonly #template: DocumentFragment = (
    document.getElementById("shadow-filesystem-base") as HTMLTemplateElement
  ).content;

  #shadowRoot?: ShadowRoot;

  public treeRows: HTMLElement | null = null;

  readonly connectedPromise: Promise<void>;
  readonly #connectedResolve: () => void;

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    this.#shadowRoot.append(FileSystemElement.#template.cloneNode(true));
    this.treeRows = this.#shadowRoot.getElementById("tree-rows")!;

    const { promise, resolve } = Promise.withResolvers<void>()
    this.#connectedResolve = resolve;
    this.connectedPromise = promise;
  }

  connectedCallback(): void {
    this.#connectedResolve();
  }
}

customElements.define("file-system", FileSystemElement);
