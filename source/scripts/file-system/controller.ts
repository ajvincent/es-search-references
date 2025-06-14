//#region preamble
import {
  FileEditorMapView
} from "../codemirror/views/FileEditorMapView.js";

import type {
  FileSystemMap
} from "../storage/FileSystemMap.js";

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

export interface FileSystemControllerIfc {
  getTreeRowsElement(): HTMLElement;
  readonly isReadOnly: boolean;
  readonly clipBoardHasCopy: boolean;

  startAddFile(pathToDirectory: string): void;
}

export class FileSystemController implements BaseView, FileSystemControllerIfc {
  readonly isReadOnly: boolean;
  readonly displayElement: FileSystemElement;

  readonly fileMap: FileSystemMap;
  readonly #filesCheckedSet = new Set<string>;
  readonly filesCheckedSet: ReadonlySet<string> = this.#filesCheckedSet;

  readonly #fileToRowMap = new Map<string, TreeRowView>;
  readonly #fileSystemView: FileSystemView<DirectoryRowView, FileRowView>;

  readonly editorMapView: FileEditorMapView;
  readonly #fsContextMenu: FileSystemContextMenu;

  readonly #directoriesSet = new Set<string>;

  constructor(
    rootId: string,
    isReadonly: boolean,
    fileSystemElement: FileSystemElement,
    fileMap: FileSystemMap,
    codeMirrorPanelsElement: HTMLElement,
  )
  {
    this.displayElement = fileSystemElement;
    this.isReadOnly = isReadonly;
    this.fileMap = fileMap;

    this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.displayElement.treeRows!);

    for (const key of this.fileMap.keys()) {
      this.#addFileKey(key);
    }

    this.editorMapView = new FileEditorMapView(fileMap, rootId, isReadonly, codeMirrorPanelsElement);

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

  #addFileKey(key: string): void {
    const view: FileRowView = this.#fileSystemView.addFileKey(key, this.#directoriesSet);
    this.#fileToRowMap.set(key, view);

    view.checkboxElement!.onclick = (ev: MouseEvent): void => {
      this.#fileCheckToggled(key, view.checkboxElement!.checked);
    };
    view.radioElement!.onclick = (ev: Event): void => {
      this.editorMapView.selectFile(key);
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
    this.editorMapView.updateFileMap();
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
    this.editorMapView.addEditorForPath(fullPath);

    this.#fileSystemView.showFile(fullPath);
    resolve(null);
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
