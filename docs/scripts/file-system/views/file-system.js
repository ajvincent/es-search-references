import { TreeGridElement } from "../../tree/views/tree-grid.js";
import { FileTreeRow } from "./tree-row.js";
export class FileSystemElement extends HTMLElement {
    static #getFragment(templateId) {
        return document.getElementById(templateId).content;
    }
    static #css = FileSystemElement.#getFragment("shadow-filesystem-css");
    static #headerCells = FileSystemElement.#getFragment("shadow-filesystem-treeheader");
    #shadowRoot;
    #treeGrid;
    connectedCallback() {
        debugger;
        const fragment = FileSystemElement.#headerCells.cloneNode(true);
        this.#treeGrid = new TreeGridElement(FileTreeRow, ["vortual://"], fragment);
        this.#shadowRoot = this.attachShadow({ "mode": "closed" });
        this.#shadowRoot.append(FileSystemElement.#css.cloneNode(true), this.#treeGrid);
    }
    getRow(key) {
        return this.#treeGrid.getRow(key);
    }
    addRow(parentKey, childKey, rowArguments) {
        return this.#treeGrid.addRow(parentKey, childKey, rowArguments);
    }
    removeRow(key) {
        return this.#treeGrid.removeRow(key);
    }
    clearRows() {
        this.#treeGrid.clearRows();
    }
}
window.customElements.define("file-system", FileSystemElement);
