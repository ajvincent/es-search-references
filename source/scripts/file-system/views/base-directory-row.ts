import {
  TreeRowView
} from "../../tree/views/tree-row.js";

export class BaseDirectoryRowView extends TreeRowView {
  readonly rowType = "directory";
  readonly fullPath: string;

  constructor(depth: number, primaryLabel: string, fullPath: string) {
    super(depth, depth > 0, primaryLabel);
    this.fullPath = fullPath;
    this.rowElement.dataset.fullpath = fullPath;
    this.rowElement.dataset.isdirectory = "true";

    this.addCells();
  }

  protected getCellElements(): HTMLElement[] {
    return [
      this.buildPrimaryLabelElement(),
    ];
  }

  public registerCollapseClick(): void {
    this.rowElement!.onclick = this.#toggleCollapsed.bind(this);
  }

  #toggleCollapsed(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.rowElement!.toggleCollapsed();
  }
}
