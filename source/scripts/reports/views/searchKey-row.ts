import {
  TreeRowView
} from "../../tree/views/tree-row.js";

export class SearchKeyRowView extends TreeRowView {
  constructor(depth: number, searchKey: string) {
    super(depth, false, searchKey);
    this.initialize();
    this.rowElement!.classList.add("searchkey");
  }

  protected getCellElements(): HTMLElement[] {
    return [
      this.buildPrimaryLabelElement(),
    ];
  }

  setSelected(): void {
    this.rowElement!.classList.add("selected");
  }

  clearSelected(): void {
    this.rowElement!.classList.remove("selected");
  }
}
