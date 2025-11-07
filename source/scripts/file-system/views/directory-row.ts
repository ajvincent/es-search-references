import {
  BaseDirectoryRowView
} from "./base-directory-row.js";

export class DirectoryRowView extends BaseDirectoryRowView {
  public override clone(): this {
    return new DirectoryRowView(
      this.depth, this.primaryLabel, this.fullPath, this.fsControllerCallbacks
    ) as this;
  }

  protected getCellElements(): HTMLElement[] {
    return [
      document.createElement("span"),
      this.buildPrimaryLabelElement(),
      document.createElement("span"),
    ];
  }
}
