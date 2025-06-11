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

void(FileSystemElement); // force the custom element upgrade

export interface FileSystemControllerIfc {
  getTreeRowsElement(): HTMLElement;
  readonly isReadOnly: boolean;
  readonly clipBoardHasCopy: boolean;
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

    const directoriesSet = new Set<string>;
    for (const key of this.fileMap.keys()) {
      this.#addFileKey(key, directoriesSet);
    }

    this.editorMapView = new FileEditorMapView(fileMap, rootId, isReadonly, codeMirrorPanelsElement);
    this.#fsContextMenu = new FileSystemContextMenu(this);
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

  #addFileKey(key: string, directoriesSet: Set<string>): void {
    const view: FileRowView = this.#fileSystemView.addFileKey(key, directoriesSet);
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
}
