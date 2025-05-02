export class ReportSelectorElement extends HTMLElement {
  static readonly #template: DocumentFragment = (document.getElementById("shadow-reports-base") as HTMLTemplateElement).content;
  #shadowRoot: ShadowRoot;

  public treeRows: HTMLElement | null = null;

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    this.#shadowRoot.append(ReportSelectorElement.#template.cloneNode(true));
    this.treeRows = this.#shadowRoot.getElementById("tree-rows")!;
  }
}

customElements.define("report-selector", ReportSelectorElement);
