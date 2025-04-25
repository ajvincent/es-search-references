class TreeRowElement extends HTMLElement {
  readonly #childrenWrapper = document.createElement("tree-children");

  constructor() {
    super();
  }

  connectedCallback() {
    this.append(...this.getCellElements(), this.#childrenWrapper);
  }

  protected getCellElements(): HTMLElement[] {
    return [];
  }
  public get labelElement(): HTMLLabelElement | null {
    return null;
  }

  public addRow(row: this): void {
    this.#childrenWrapper.append(row);
  }

  public toggleCollapsed(): void {
    this.classList.toggle("collapsed");
  }
}

window.customElements.define("tree-row", TreeRowElement);
export { TreeRowElement };
