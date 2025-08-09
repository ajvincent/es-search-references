import type {
  Class
} from "type-fest";

import {
  DirectoryRecord
} from "../../opfs/types/WebFileSystemIfc.js";

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
  readonly #isFileCollapsible: boolean;
  readonly #fileToRowMap = new Map<string, FileView | DirectoryView>;
  readonly #treeRowsElement: HTMLElement;

  readonly #DirectoryViewClass: Class<DirectoryView, DirectoryArguments>;
  readonly #FileViewClass: Class<FileView, FileArguments>;

  constructor(
    DirectoryViewClass: Class<DirectoryView, DirectoryArguments>,
    FileViewClass: Class<FileView, FileArguments>,
    isFileCollapsible: boolean,
    treeRowsElement: HTMLElement,
    initialIndex: DirectoryRecord
  )
  {
    this.#DirectoryViewClass = DirectoryViewClass;
    this.#FileViewClass = FileViewClass;
    this.#isFileCollapsible = isFileCollapsible;
    this.#treeRowsElement = treeRowsElement;

    this.fillDirectoryFromTop(initialIndex);
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

  fillDirectoryFromTop(
    topRecord: DirectoryRecord
  ): void
  {
    for (const [key, contentsOrRecord] of Object.entries(topRecord)) {
      let view: FileView | DirectoryView;
      if (typeof contentsOrRecord === "string") {
        view = new this.#FileViewClass(0, this.#isFileCollapsible, key, key);
      }
      else {
        view = new this.#DirectoryViewClass(0, key, key);
        this.#fillDirectoryView(contentsOrRecord, view);
      }

      this.#fileToRowMap.set(key, view);
      this.#treeRowsElement.append(view.rowElement!);
    }
  }

  #fillDirectoryView(
    parentRecord: DirectoryRecord,
    parentView: DirectoryView
  ): void
  {
    const depth = parentView.depth + 1;
    for (const [key, contentsOrRecord] of Object.entries(parentRecord)) {
      let fullPath: string;
      if (parentView.fullPath.endsWith("/")) {
        fullPath = parentView.fullPath + key;
      } else {
        fullPath = parentView.fullPath + "/" + key;
      }

      let view: FileView | DirectoryView;
      if (typeof contentsOrRecord === "string") {
        view = new this.#FileViewClass(depth, this.#isFileCollapsible, key, fullPath);
      } else {
        view = new this.#DirectoryViewClass(depth, key, fullPath);
        this.#fillDirectoryView(contentsOrRecord, view);
      }

      this.#fileToRowMap.set(fullPath, view);
      parentView.rowElement!.append(view.rowElement!);
    }
  }

  showFile(
    fullPath: string
  ): void
  {
    (this.#fileToRowMap.get(fullPath) as FileView).selectFile(fullPath);
  }

  * descendantFileViews(): IterableIterator<[string, FileView]>
  {
    for (const [fullPath, view] of this.#fileToRowMap.entries()) {
      if (view instanceof this.#FileViewClass)
        yield [fullPath, view];
    }
  }
}
