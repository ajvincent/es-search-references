import {
  TreeRowView
} from "../../tree/views/tree-row.js";

import type {
  FilePathAndDepth,
  FileSystemValue,
} from "../FileSystemMap.js";

import type {
  FSControllerCallbacksIfc
} from "../types/FSControllerCallbacksIfc.js";

export abstract class BaseFileEntryRowView
extends TreeRowView
implements FileSystemValue
{
  public readonly abstract rowType: "directory" | "file";

  #depth: number;
  #fullPath: string;

  protected readonly fsControllerCallbacks: FSControllerCallbacksIfc | undefined;

  constructor(
    depth: number,
    isCollapsible: boolean,
    label: string,
    fullPath: string,
    fsControllerCallbacks: FSControllerCallbacksIfc | undefined,
    isDirectory: boolean,
  )
  {
    super(depth, isCollapsible, label);
    this.#depth = depth;
    this.#fullPath = fullPath;
    this.rowElement.dataset.fullpath = fullPath;
    this.fsControllerCallbacks = fsControllerCallbacks;
    if (isDirectory)
      this.rowElement.dataset.isdirectory = "true";

    this.addCells();

    if (fsControllerCallbacks) {
      this.rowElement.addEventListener(
        "contextmenu",
        event => fsControllerCallbacks.showFSContextMenu(event, fullPath, isDirectory)
      );
    }
  }

  get depth(): number {
    return this.#depth;
  }

  get fullPath(): string {
    return this.#fullPath;
  }

  abstract clone(): this;

  updateFilePathAndDepth(filePathAndDepth: FilePathAndDepth): void {
    this.#depth = filePathAndDepth.depth;
    this.#fullPath = filePathAndDepth.filePath;
    this.rowElement.dataset.fullpath = filePathAndDepth.filePath;
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
