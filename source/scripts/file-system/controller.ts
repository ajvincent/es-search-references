import {
  FileRowView
} from "./views/file-row.js";

import {
  DirectoryRowView
} from "./views/directory-row.js";

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

class RowMetadata {
  readonly view: TreeRowView;
  constructor(view: TreeRowView) {
    this.view = view;
  }
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

  readonly #fileToRowMap = new Map<string, RowMetadata>;

  constructor(
    id: string,
    isReadonly: boolean,
    callbacks: FileSystemCallbacks
  )
  {
    this.#rootElement = document.getElementById(id) as FileSystemElement;
    this.#isReadOnly = isReadonly;
    this.#callbacks = callbacks;
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
    const [parent, leaf] = FileSystemController.#getParentAndLeaf(key);
    if (parent && directoriesSet.has(parent) === false) {
      this.#addDirectoryKey(parent, directoriesSet);
    }

    const parentRowData = this.#fileToRowMap.get(parent)!
    const view = new FileRowView(parentRowData.view.depth + 1, leaf, key);
    const rowData = new RowMetadata(view);
    this.#fileToRowMap.set(key, rowData);

    view.checkboxElement!.onclick = (ev: MouseEvent): void => {
      this.#callbacks.fileCheckToggled(key, view.checkboxElement!.checked);
    };
    view.radioElement!.onclick = (ev: Event): void => {
      this.#callbacks.fileSelected(key);
    };

    view.rowElement!.onclick = (ev: MouseEvent): void => {
      ev.stopPropagation();
    }

    this.#fileToRowMap.get(parent)!.view.addRow(view);
  }

  #addDirectoryKey(key: string, directoriesSet: Set<string>): void {
    let [parent, leaf] = FileSystemController.#getParentAndLeaf(key);
    if (parent && directoriesSet.has(parent) === false) {
      this.#addDirectoryKey(parent, directoriesSet);
    }

    let depth: number
    if (parent === "") {
      depth = 0;
      leaf = "virtual://";
    } else {
      depth = this.#fileToRowMap.get(parent)!.view.depth + 1
    }

    const view = new DirectoryRowView(depth, leaf);
    const rowData = new RowMetadata(view);
    this.#fileToRowMap.set(key, rowData);

    if (depth > 0) {
      view.registerCollapseClick();
      this.#fileToRowMap.get(parent)!.view.addRow(view);
    } else {
      this.#rootElement.treeRows!.append(view.rowElement!);
    }
    directoriesSet.add(key);
  }
}
