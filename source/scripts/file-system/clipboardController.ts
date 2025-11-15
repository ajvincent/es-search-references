import type { DirectoryRecord, OPFSWebFileSystemIfc } from "../opfs/types/WebFileSystemIfc.js";
import { FileSystemElement } from "./elements/file-system.js";
import { FileSystemMap } from "./FileSystemMap.js";
import { DirectoryRowView } from "./views/directory-row.js";
import { FileRowView } from "./views/file-row.js";
import { FileSystemView } from "./views/file-system.js";

export class ClipboardController {
  public static readonly rowName = "(clipboard)";

  #fileSystemElement: FileSystemElement;
  #webFS: OPFSWebFileSystemIfc;
  #clipboardHasCopy: boolean;

  readonly fileToRowMap: FileSystemMap<DirectoryRowView | FileRowView>;
  #fileSystemView: FileSystemView<DirectoryRowView, FileRowView>;

  constructor(
    fileSystemElement: FileSystemElement,
    webFS: OPFSWebFileSystemIfc,
  )
  {
    this.#fileSystemElement = fileSystemElement;
    this.#webFS = webFS;
    this.#clipboardHasCopy = false;

    const fileToRowMap = new FileSystemMap<DirectoryRowView | FileRowView>(0);
    this.fileToRowMap = fileToRowMap;
    this.#fileSystemView = new FileSystemView(
      DirectoryRowView, FileRowView, false, this.#fileSystemElement.treeRows!,
      { [ClipboardController.rowName]: {} }, fileToRowMap
    );

    this.clipboardRow.rowElement.classList.add("clipboard-row");
  }

  get fileSystemView(): FileSystemView<DirectoryRowView, FileRowView>
  {
    return this.#fileSystemView;
  }

  async rebuild(): Promise<void> {
    this.#fileSystemView.clearRowMap();

    const index: DirectoryRecord = await this.#webFS.getClipboardIndex();
    this.#clipboardHasCopy = Object.entries(index).length > 0;
    this.#fileSystemView = new FileSystemView(
      DirectoryRowView, FileRowView, false, this.#fileSystemElement.treeRows!,
      { [ClipboardController.rowName]: index }, this.fileToRowMap
    );
  }

  public get clipboardRow(): DirectoryRowView {
    return this.#fileSystemView.getRowView(ClipboardController.rowName) as DirectoryRowView;
  }

  public get clipboardHasCopy(): boolean {
    return this.#clipboardHasCopy;
  }
}
