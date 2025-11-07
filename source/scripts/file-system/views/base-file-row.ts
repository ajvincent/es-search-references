import type {
  FSControllerCallbacksIfc
} from "../types/FSControllerCallbacksIfc.js";

import {
  BaseFileEntryRowView
} from "./base-file-entry-row.js";

export class BaseFileRowView extends BaseFileEntryRowView {
  public readonly rowType = "file";

  constructor(
    depth: number,
    isCollapsible: boolean,
    label: string,
    fullPath: string,
    fsControllerCallbacks: FSControllerCallbacksIfc | undefined
  )
  {
    super(depth, isCollapsible, label, fullPath, fsControllerCallbacks, false);
  }

  public clone(): this {
    return new BaseFileRowView(
      this.depth, this.isCollapsible, this.primaryLabel, this.fullPath, this.fsControllerCallbacks
    ) as this;
  }

  selectFile(): void {
    throw new Error("not implemented");
  }
}
