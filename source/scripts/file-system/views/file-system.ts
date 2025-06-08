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
  static #getParentAndLeaf(key: string): [string, string] {
    if (key === "virtual:/") {
      return ["", "virtual://"];
    }
    let lastSlash = key.lastIndexOf("/");
    if (lastSlash === -1) {
      return ["", key];
    }
    const parent = key.substring(0, lastSlash);
    const leaf = key.substring(lastSlash + 1);
    return [parent, leaf];
  }

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

  clearRowMap(): void {
    for (const row of this.#fileToRowMap.values())
      row.removeAndDispose();
    this.#fileToRowMap.clear();
  }

  addFileKey(key: string, directoriesSet: Set<string>): FileView {
    const [parent, leaf] = FileSystemView.#getParentAndLeaf(key);
    if (parent && directoriesSet.has(parent) === false) {
      this.#addDirectoryKey(parent, directoriesSet);
    }
    const parentRowView = this.#fileToRowMap.get(parent)!;
    const view: FileView = new this.#FileViewClass(parentRowView.depth +1, this.#isFileCollapsible, leaf, key);
    this.#fileToRowMap.set(key, view);
    parentRowView.addRow(view);

    return view;
  }

  #addDirectoryKey(key: string, directoriesSet: Set<string>): void {
    let [parent, leaf] = FileSystemView.#getParentAndLeaf(key);
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
      this.#fileToRowMap.get(parent)!.addRow(view);
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
