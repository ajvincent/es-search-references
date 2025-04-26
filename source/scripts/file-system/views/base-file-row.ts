import {
  TreeRowView
} from "../../tree/views/tree-row.js";

export class BaseFileRowView extends TreeRowView {
  protected readonly fullPath: string;

  constructor(depth: number, isCollapsible: boolean, label: string, fullPath: string) {
    super(depth, isCollapsible, label);
    this.fullPath = fullPath;
    this.initialize();
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
