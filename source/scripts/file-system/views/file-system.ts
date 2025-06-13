import type {
  Class
} from "type-fest";

import type {
  TreeRowView
} from "../../tree/views/tree-row.js";

import type {
  BaseDirectoryRowView,
} from "./base-directory-row.js";

import type {
  BaseFileRowView,
} from "./base-file-row.js";

import {
  getParentAndLeaf
} from "../../utilities/getParentAndLeaf.js";

type DirectoryArguments = [
  depth: number, primaryLabel: string, fullPath: string
];
type FileArguments = [
  depth: number, isCollapsible: boolean, label: string, fullPath: string
];

export class FileSystemView<
  DirectoryView extends BaseDirectoryRowView,
  FileView extends BaseFileRowView
>
{
  readonly #isFileCollapsible: boolean;
  readonly #fileToRowMap = new Map<string, FileView | DirectoryView>;
  readonly #treeRowsElement: HTMLElement;

  readonly #DirectoryViewClass: Class<DirectoryView, DirectoryArguments>;
  readonly #FileViewClass: Class<FileView, FileArguments>;

  constructor(
    DirectoryViewClass: Class<DirectoryView, DirectoryArguments>,
    FileViewClass: Class<FileView, FileArguments>,
    isFileCollapsible: boolean,
    treeRowsElement: HTMLElement
  )
  {
    this.#DirectoryViewClass = DirectoryViewClass;
    this.#FileViewClass = FileViewClass;
    this.#isFileCollapsible = isFileCollapsible;
    this.#treeRowsElement = treeRowsElement;
  }

  hasRowView(key: string): boolean {
    return this.#fileToRowMap.has(key);
  }

  getRowView(key: string): DirectoryView | FileView {
    const view = this.#fileToRowMap.get(key);
    if (!view)
      throw new Error("no view found with that key!");
    return view;
  }

  clearRowMap(): void {
    for (const row of this.#fileToRowMap.values())
      row.removeAndDispose();
    this.#fileToRowMap.clear();
  }

  addFileKey(key: string, directoriesSet: Set<string>): FileView {
    const [parent, leaf] = getParentAndLeaf(key);
    if (parent && directoriesSet.has(parent) === false) {
      this.#addDirectoryKey(parent, directoriesSet);
    }
    const parentRowView = this.#fileToRowMap.get(parent)!;
    const view: FileView = new this.#FileViewClass(parentRowView.depth +1, this.#isFileCollapsible, leaf, key);
    this.#fileToRowMap.set(key, view);
    parentRowView.insertRowSorted(view);

    return view;
  }

  #addDirectoryKey(key: string, directoriesSet: Set<string>): void {
    let [parent, leaf] = getParentAndLeaf(key);
    if (parent && directoriesSet.has(parent) === false) {
      this.#addDirectoryKey(parent, directoriesSet);
    }

    let depth: number
    if (parent === "") {
      depth = 0;
    } else {
      depth = this.#fileToRowMap.get(parent)!.depth + 1
    }

    const view = new this.#DirectoryViewClass(depth, leaf, key);
    this.#fileToRowMap.set(key, view);

    if (depth > 0) {
      view.registerCollapseClick();
      this.#fileToRowMap.get(parent)!.insertRowSorted(view);
    } else {
      this.#treeRowsElement.append(view.rowElement!);
    }
    directoriesSet.add(key);
  }

  showFile(
    key: string
  ): void
  {
    (this.#fileToRowMap.get(key) as FileView).selectFile(key);
  }
}
