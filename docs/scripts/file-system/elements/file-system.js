export class FileSystemElement extends HTMLElement {
    static #template = document.getElementById("shadow-filesystem-base").content;
    #shadowRoot;
    treeRows = null;
    constructor() {
        super();
        this.#shadowRoot = this.attachShadow({ mode: "closed" });
        this.#shadowRoot.append(FileSystemElement.#template.cloneNode(true));
        this.treeRows = this.#shadowRoot.getElementById("tree-rows");
    }
}
customElements.define("file-system", FileSystemElement);
