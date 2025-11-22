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
}
