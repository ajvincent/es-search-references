import { TreeGridElement } from "../../tree/views/tree-grid.js";
import { FileTreeRow } from "./tree-row.js";

export type FileRowArguments = [label: string, fullPath?: string];

export class FileSystemElement extends HTMLElement {
  static #getFragment(
    templateId: string
  ): DocumentFragment
  {
    return (document.getElementById(templateId) as HTMLTemplateElement).content;
  }
  static readonly #css: DocumentFragment = FileSystemElement.#getFragment("shadow-filesystem-css");
  static readonly #headerCells: DocumentFragment = FileSystemElement.#getFragment("shadow-filesystem-treeheader");

  #shadowRoot?: ShadowRoot;
  #treeGrid?: TreeGridElement<FileTreeRow, FileRowArguments>;

  connectedCallback(): void {
    debugger;
    const fragment = FileSystemElement.#headerCells.cloneNode(true) as DocumentFragment;
    this.#treeGrid = new TreeGridElement(FileTreeRow, ["vortual://"], fragment);

    this.#shadowRoot = this.attachShadow({"mode": "closed"});
    this.#shadowRoot.append(FileSystemElement.#css.cloneNode(true), this.#treeGrid);
  }

  getRow(key: string): FileTreeRow | undefined {
    return this.#treeGrid!.getRow(key);
  }

  public addRow(
    parentKey: string,
    childKey: string,
    rowArguments: FileRowArguments
  ): FileTreeRow
  {
    return this.#treeGrid!.addRow(parentKey, childKey, rowArguments);
  }

  public removeRow(key: string) {
    return this.#treeGrid!.removeRow(key);
  }

  public clearRows(): void {
    this.#treeGrid!.clearRows();
  }
}

window.customElements.define("file-system", FileSystemElement);
