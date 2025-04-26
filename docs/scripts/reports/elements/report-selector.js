export class ReportSelectorElement extends HTMLElement {
    static #template = document.getElementById("shadow-reports-base").content;
    #shadowRoot;
    treeRows = null;
    constructor() {
        super();
        this.#shadowRoot = this.attachShadow({ mode: "closed" });
        this.#shadowRoot.append(ReportSelectorElement.#template.cloneNode(true));
        this.treeRows = this.#shadowRoot.getElementById("tree-rows");
    }
}
customElements.define("report-selector", ReportSelectorElement);
