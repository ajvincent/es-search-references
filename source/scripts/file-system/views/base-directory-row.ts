import {
  TreeRowView
} from "../../tree/views/tree-row.js";

export class BaseDirectoryRowView extends TreeRowView {
  constructor(depth: number, primaryLabel: string) {
    super(depth, depth > 0, primaryLabel);
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
