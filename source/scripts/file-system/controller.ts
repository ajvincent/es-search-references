import {
  FileEditorMapView
} from "../codemirror/views/FileMapView.js";

import type {
  BaseView
} from "../tab-panels/tab-panels-view.js";

import type {
  TreeRowView
} from "../tree/views/tree-row.js";

import {
  FileRowView
} from "./views/file-row.js";

import {
  DirectoryRowView
} from "./views/directory-row.js";

import {
  FileSystemView
} from "./views/file-system.js";

import {
  FileSystemElement
} from "./elements/file-system.js";

void(FileSystemElement); // force the custom element upgrade

export class FileSystemController implements BaseView {
  readonly isReadOnly: boolean;
  readonly displayElement: FileSystemElement;

  readonly fileMap: ReadonlyMap<string, string>;
  readonly #filesCheckedSet = new Set<string>;
  readonly filesCheckedSet: ReadonlySet<string> = this.#filesCheckedSet;

  readonly #fileToRowMap = new Map<string, TreeRowView>;
  readonly #fileSystemView: FileSystemView<DirectoryRowView, FileRowView>;

  readonly editorMapView: FileEditorMapView;

  constructor(
    rootId: string,
    isReadonly: boolean,
    fileMap: Map<string, string>,
    codeMirrorPanelsElement: HTMLElement,
  )
  {
    this.displayElement = document.getElementById("fss:" + rootId) as FileSystemElement;
    if (!this.displayElement)
      throw new Error("no element for root id: " + rootId);
    this.isReadOnly = isReadonly;

    const fileEntries = Array.from(fileMap.entries());
    fileEntries.sort((a, b) => a[0].localeCompare(b[0]));
    this.fileMap = new Map(fileEntries);

    this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.displayElement.treeRows!);

    const directoriesSet = new Set<string>;
    for (const key of this.fileMap.keys()) {
      this.#addFileKey(key, directoriesSet);
    }

    this.editorMapView = new FileEditorMapView(fileMap, rootId, codeMirrorPanelsElement);
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
}
