import type {
  FSControllerCallbacksIfc
} from "../types/FSControllerCallbacksIfc.js";
import {
  BaseFileEntryRowView
} from "./base-file-entry-row.js";

export class BaseDirectoryRowView extends BaseFileEntryRowView {
  public readonly rowType = "directory";

  constructor(
    depth: number,
    primaryLabel: string,
    fullPath: string,
    fsControllerCallbacks: FSControllerCallbacksIfc | undefined)
  {
    super(depth, depth > 0, primaryLabel, fullPath, fsControllerCallbacks, true);
  }

  public clone(): this {
    return new BaseDirectoryRowView(
      this.depth, this.primaryLabel, this.fullPath, this.fsControllerCallbacks
    ) as this;
  }
}
