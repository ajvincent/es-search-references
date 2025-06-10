export class FileSystemElement extends HTMLElement {
  static readonly #template: DocumentFragment = (document.getElementById("shadow-filesystem-base") as HTMLTemplateElement).content;

  public treeRows: HTMLElement | null = null;

  readonly connectedPromise: Promise<void>;
  readonly #connectedResolve: () => void;

  constructor() {
    super();

    this.append(FileSystemElement.#template.cloneNode(true));
    this.treeRows = this.getElementsByTagName("tree-rows")[0] as HTMLElement;

    const { promise, resolve } = Promise.withResolvers<void>()
    this.#connectedResolve = resolve;
    this.connectedPromise = promise;
  }

  connectedCallback(): void {
    this.#connectedResolve();
  }
}

customElements.define("file-system", FileSystemElement);
