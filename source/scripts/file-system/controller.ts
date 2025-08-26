//#region preamble
import {
  FileEditorMapView
} from "../codemirror/views/FileEditorMapView.js";

import type {
  DirectoryRecord,
  OPFSWebFileSystemIfc
} from "../opfs/types/WebFileSystemIfc.js";

import type {
  BaseView
} from "../tab-panels/tab-panels-view.js";

import type {
  TreeRowView
} from "../tree/views/tree-row.js";

import {
  FileSystemContextMenu
} from "./contextMenu.js";

import {
  FileSystemElement
} from "./elements/file-system.js";

import {
  FileRowView
} from "./views/file-row.js";

import {
  DirectoryRowView
} from "./views/directory-row.js";

import {
  FileSystemView
} from "./views/file-system.js";
//#endregion preamble

void(FileSystemElement); // force the custom element upgrade

/* This is for the context menu. */
export interface FileSystemControllerIfc {
  getTreeRowsElement(): HTMLElement;
  readonly isReadOnly: boolean;
  readonly clipBoardHasCopy: boolean;

  startAddFile(pathToDirectory: string): void;
}

export class FileSystemController implements BaseView, FileSystemControllerIfc {
  public static async build(
    rootId: string,
    isReadonly: boolean,
    fileSystemElement: FileSystemElement,
    codeMirrorPanelsElement: HTMLElement,

    webFS: OPFSWebFileSystemIfc,
  ): Promise<FileSystemController>
  {
    const index: DirectoryRecord = await webFS.getIndex();
    return new FileSystemController(
      rootId,
      isReadonly,
      fileSystemElement,
      codeMirrorPanelsElement,
      webFS,
      index
    );
  }

  readonly isReadOnly: boolean;
  readonly displayElement: FileSystemElement;

  readonly #webFS: OPFSWebFileSystemIfc;

  readonly #filesCheckedSet = new Set<string>;
  readonly filesCheckedSet: ReadonlySet<string> = this.#filesCheckedSet;

  readonly #fileToRowMap = new Map<string, TreeRowView>;
  readonly #fileSystemView: FileSystemView<DirectoryRowView, FileRowView>;

  readonly editorMapView: FileEditorMapView;
  readonly #fsContextMenu: FileSystemContextMenu;

  readonly #directoriesSet = new Set<string>;

  private constructor(
    rootId: string,
    isReadonly: boolean,
    fileSystemElement: FileSystemElement,
    codeMirrorPanelsElement: HTMLElement,
    webFS: OPFSWebFileSystemIfc,
    index: DirectoryRecord
  )
  {
    this.displayElement = fileSystemElement;
    this.isReadOnly = isReadonly;
    this.#webFS = webFS;

    this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.displayElement.treeRows!, index);
    for (const [fullPath, fileView] of this.#fileSystemView.descendantFileViews()) {
      this.#addFileEventHandlers(fullPath, fileView)
    }

    this.editorMapView = new FileEditorMapView(rootId, isReadonly, codeMirrorPanelsElement, webFS);

    this.#fsContextMenu = new FileSystemContextMenu(this);
    void this.#fsContextMenu;
  }

  dispose(): void {
    this.displayElement.remove();
    this.#fileToRowMap.clear();
    this.#fileSystemView.clearRowMap();
    this.editorMapView.dispose();
  }

  #fileCheckToggled(pathToFile: string, isChecked: boolean): void {
    if (isChecked)
      this.#filesCheckedSet.add(pathToFile);
    else
      this.#filesCheckedSet.delete(pathToFile);
  }

  #addFileEventHandlers(fullPath: string, view: FileRowView): void {
    this.#fileToRowMap.set(fullPath, view);

    view.checkboxElement!.onclick = (ev: MouseEvent): void => {
      this.#fileCheckToggled(fullPath, view.checkboxElement!.checked);
    };
    view.radioElement!.onclick = (ev: Event): void => {
      this.editorMapView.selectFile(fullPath);
    };

    view.rowElement!.onclick = (ev: MouseEvent): void => {
      ev.stopPropagation();
    }
  }

  showFileAndLineNumber(
    specifier: string,
    lineNumber: number
  ): void
  {
    this.#fileSystemView.showFile(specifier);
    this.editorMapView!.scrollToLine(lineNumber);
  }

  updateFileMap(): void {
    throw new Error("need to reimplement");
    /*
    this.editorMapView.updateFileMap();
    */
  }

  // FileSystemControllerIfc
  getTreeRowsElement(): HTMLElement {
    return this.displayElement.treeRows!;
  }

  // FileSystemControllerIfc
  get clipBoardHasCopy(): boolean {
    return false;
  }

  // FileSystemControllerIfc
  async startAddFile(pathToDirectory: string): Promise<void> {
    /*
    const parentRowView = this.#fileSystemView.getRowView(pathToDirectory);
    if (parentRowView.rowType !== "directory") {
      throw new Error("row type must be a directory: " + pathToDirectory);
    }

    const newRowView = new FileRowView(parentRowView.depth + 1, false, "", parentRowView + "/");
    parentRowView.prependRow(newRowView);

    let { promise, resolve } = Promise.withResolvers<string | null>();
    promise = promise.finally(() => parentRowView.removeRow(newRowView));
    const localPath: string | null = await newRowView.editLabel(promise);

    if (!localPath) {
      resolve(null);
      return;
    }

    if (!this.#isValidNewFileName(parentRowView.fullPath, localPath, true)) {
      resolve(null);
      return;
    }

    const fullPath = parentRowView.fullPath + "/" + localPath;

    this.fileMap.set(fullPath, "");
    this.#addFileKey(fullPath);
    await this.editorMapView.addEditorForPath(fullPath);

    this.#fileSystemView.showFile(fullPath);
    resolve(null);
    */
    return Promise.reject(new Error("this is being rewritten"));
  }

  #isValidNewFileName(
    parentPath: string,
    localPath: string,
    isNewFile: boolean,
  ): boolean
  {
    if (localPath === "" || localPath.startsWith("./") || localPath.startsWith("../")) {
      return false;
    }

    if (!isNewFile && localPath.includes("/"))
      return false;

    const fullPath = parentPath + "/" + localPath;
    if (this.#fileSystemView.hasRowView(fullPath))
      return false;

    return true;
  }
}
