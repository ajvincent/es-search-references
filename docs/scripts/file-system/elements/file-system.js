export class FileSystemElement extends HTMLElement {
    static #template = document.getElementById("shadow-filesystem-base").content;
    #shadowRoot;
    treeRows = null;
    connectedPromise;
    #connectedResolve;
    constructor() {
        super();
        this.#shadowRoot = this.attachShadow({ mode: "closed" });
        this.#shadowRoot.append(FileSystemElement.#template.cloneNode(true));
        this.treeRows = this.#shadowRoot.getElementById("tree-rows");
        const { promise, resolve } = Promise.withResolvers();
        this.#connectedResolve = resolve;
        this.connectedPromise = promise;
    }
    connectedCallback() {
        this.#connectedResolve();
    }
}
customElements.define("file-system", FileSystemElement);
