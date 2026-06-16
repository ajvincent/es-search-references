import {
  TreeRowView
} from "../../tree/views/tree-row.js";

export class SearchKeyRowView extends TreeRowView {
  readonly rowType = "searchKey";
  constructor(depth: number, searchKey: string) {
    super(depth, false, searchKey);
    this.addCells();
    this.rowElement.classList.add("searchkey");
  }

  protected getCellElements(): HTMLElement[] {
    return [
      this.buildPrimaryLabelElement(),
    ];
  }

  setSelected(): void {
    this.rowElement.classList.add("selected");
  }

  clearSelected(): void {
    this.rowElement.classList.remove("selected");
  }

  protected buildPrimaryLabelElement(): HTMLLabelElement {
    const label = super.buildPrimaryLabelElement();
    if (this.primaryLabel === "") {
      const em = document.createElement("em");
      em.append("(script log)");
      label.replaceChildren(em);
    }
    return label;
  }
}
