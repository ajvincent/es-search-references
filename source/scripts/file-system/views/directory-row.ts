import {
  BaseDirectoryRowView
} from "./base-directory-row.js";

export class DirectoryRowView extends BaseDirectoryRowView {
  protected getCellElements(): HTMLElement[] {
    return [
      document.createElement("span"),
      this.buildPrimaryLabelElement(),
      document.createElement("span"),
    ];
  }
}
