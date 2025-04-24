export abstract class TreeRowElement extends HTMLElement {
  static readonly #baseRowTemplate: DocumentFragment = (document.getElementById("tree-row-base") as HTMLTemplateElement).content;

  readonly #childrenWrapper = document.createElement("tree-children");

  connectedCallback() {
    this.append(...this.getCellElements(), this.#childrenWrapper);
  }

  public abstract getCellElements(): HTMLElement[];

  public addRow(row: this): void {
    this.#childrenWrapper.append(row);
  }
}
