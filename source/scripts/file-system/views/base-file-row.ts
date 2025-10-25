import {
  TreeRowView
} from "../../tree/views/tree-row.js";

import type {
  FSControllerCallbacksIfc
} from "../types/FSControllerCallbacksIfc.js";

export class BaseFileRowView extends TreeRowView {
  public readonly rowType = "file";
  public readonly fullPath: string;

  constructor(
    depth: number,
    isCollapsible: boolean,
    label: string,
    fullPath: string,
    fsControllerCallbacks: FSControllerCallbacksIfc | undefined
  )
  {
    super(depth, isCollapsible, label);
    this.fullPath = fullPath;
    this.rowElement.dataset.fullpath = fullPath;
    this.addCells();

    if (fsControllerCallbacks) {
      this.rowElement.addEventListener(
        "contextmenu",
        event => fsControllerCallbacks.showFSContextMenu(event, fullPath, false)
      );
    }
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

  selectFile(key: string): void {
    throw new Error("not implemented");
  }
}
