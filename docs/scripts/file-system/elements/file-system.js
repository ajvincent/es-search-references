export class FileSystemElement extends HTMLElement {
    static #template = document.getElementById("shadow-filesystem-base").content;
    treeRows = null;
    connectedPromise;
    #connectedResolve;
    constructor() {
        super();
        this.append(FileSystemElement.#template.cloneNode(true));
        this.treeRows = this.getElementsByTagName("tree-rows")[0];
        const { promise, resolve } = Promise.withResolvers();
        this.#connectedResolve = resolve;
        this.connectedPromise = promise;
    }
    connectedCallback() {
        this.#connectedResolve();
    }
}
customElements.define("file-system", FileSystemElement);
