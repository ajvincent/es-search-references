import {
  FileRowView
} from "./views/file-row.js";

import {
  DirectoryRowView
} from "./views/directory-row.js";

import {
  FileSystemView
} from "./views/file-system.js";

import type {
  TreeRowView
} from "../tree/views/tree-row.js";

import {
  FileSystemElement
} from "./elements/file-system.js";

export interface FileSystemCallbacks {
  fileSelected(pathToFile: string): void;
  fileCheckToggled(pathToFile: string, isChecked: boolean): void;
}

void(FileSystemElement); // force the custom element upgrade

export class FileSystemController {
  static #getParentAndLeaf(key: string): [string, string] {
    let lastSlash = key.lastIndexOf("/");
    if (lastSlash === -1) {
      return ["", key];
    }
    const parent = key.substring(0, lastSlash);
    const leaf = key.substring(lastSlash + 1);
    return [parent, leaf];
  }

  #isReadOnly: boolean;
  #rootElement: FileSystemElement;

  #fileMap: ReadonlyMap<string, string> = new Map<string, string>;
  readonly #callbacks: FileSystemCallbacks;

  readonly #fileToRowMap = new Map<string, TreeRowView>;
  readonly #fileSystemView: FileSystemView<DirectoryRowView, FileRowView>;

  constructor(
    rootId: string,
    isReadonly: boolean,
    callbacks: FileSystemCallbacks,
  )
  {
    this.#rootElement = document.getElementById(rootId) as FileSystemElement;
    this.#isReadOnly = isReadonly;
    this.#callbacks = callbacks;

    this.#fileSystemView = new FileSystemView(DirectoryRowView, FileRowView, false, this.#rootElement.treeRows!)
  }

  setFileMap(
    fileMap: ReadonlyMap<string, string>
  ): void
  {
    this.#fileToRowMap.clear();
    this.#rootElement.treeRows!.replaceChildren();

    const fileEntries = Array.from(fileMap.entries());
    fileEntries.sort((a, b) => a[0].localeCompare(b[0]));
    this.#fileMap = new Map(fileEntries);

    const directoriesSet = new Set<string>;
    for (const key of this.#fileMap.keys()) {
      this.#addFileKey(key, directoriesSet);
    }
  }

  #addFileKey(key: string, directoriesSet: Set<string>): void {
    const view: FileRowView = this.#fileSystemView.addFileKey(key, directoriesSet);
    this.#fileToRowMap.set(key, view);

    view.checkboxElement!.onclick = (ev: MouseEvent): void => {
      this.#callbacks.fileCheckToggled(key, view.checkboxElement!.checked);
    };
    view.radioElement!.onclick = (ev: Event): void => {
      this.#callbacks.fileSelected(key);
    };

    view.rowElement!.onclick = (ev: MouseEvent): void => {
      ev.stopPropagation();
    }
  }
}
