import type {
  Class
} from "type-fest";

import type {
  DirectoryRecord
} from "../../opfs/types/WebFileSystemIfc.js";

import {
  FileSystemMap
} from "../FileSystemMap.js";

import type {
  FSControllerCallbacksIfc
} from "../types/FSControllerCallbacksIfc.js";

import type {
  BaseDirectoryRowView,
} from "./base-directory-row.js";

import type {
  BaseFileRowView,
} from "./base-file-row.js";

export type DirectoryArguments = [
  depth: number,
  primaryLabel: string,
  fullPath: string,
  fsController?: FSControllerCallbacksIfc
];

export type FileArguments = [
  depth: number,
  isCollapsible: boolean,
  label: string,
  fullPath: string,
  fsController?: FSControllerCallbacksIfc
];

export class FileSystemView<
  DirectoryView extends BaseDirectoryRowView,
  FileView extends BaseFileRowView
>
{
  readonly #isFileCollapsible: boolean;
  readonly #fileToRowMap: FileSystemMap<FileView | DirectoryView>;
  readonly #topLevelDirs: string[] = [];
  readonly #treeRowsElement: HTMLElement;

  readonly #DirectoryViewClass: Class<DirectoryView, DirectoryArguments>;
  readonly #FileViewClass: Class<FileView, FileArguments>;

  readonly #fileFilter?: (fullPath: string) => boolean;
  readonly #controllerCallbacks?: FSControllerCallbacksIfc;

  constructor(
    DirectoryViewClass: Class<DirectoryView, DirectoryArguments>,
    FileViewClass: Class<FileView, FileArguments>,
    isFileCollapsible: boolean,
    treeRowsElement: HTMLElement,
    initialIndex: DirectoryRecord,
    fileToRowMap: FileSystemMap<FileView | DirectoryView>,
    fileFilter?: (fullPath: string) => boolean,
    controllerCallbacks?: FSControllerCallbacksIfc,
  )
  {
    this.#DirectoryViewClass = DirectoryViewClass;
    this.#FileViewClass = FileViewClass;
    this.#isFileCollapsible = isFileCollapsible;
    this.#treeRowsElement = treeRowsElement;
    this.#fileFilter = fileFilter;
    this.#fileToRowMap = fileToRowMap;
    this.#controllerCallbacks = controllerCallbacks;

    this.#fillDirectoryView(initialIndex, null);
  }

  hasRowView(key: string): boolean {
    return this.#fileToRowMap.has(key);
  }

  getRowView(key: string): DirectoryView | FileView {
    const view = this.#fileToRowMap.get(key);
    if (!view)
      throw new Error("no view found with the key: " + key);
    return view;
  }

  clearRowMap(): void {
    for (const row of this.#fileToRowMap.values())
      row.removeAndDispose();
    this.#fileToRowMap.clear();
  }

  #fillDirectoryView(
    parentRecord: DirectoryRecord,
    parentView: DirectoryView | null
  ): boolean
  {
    const depth = parentView ? parentView.depth + 1 : 0;

    const shouldShowSet = new Set<FileView | DirectoryView>;
    for (const [key, contentsOrRecord] of Object.entries(parentRecord)) {
      let fullPath: string;
      if (parentView) {
        if (parentView.fullPath.endsWith("/")) {
          fullPath = parentView.fullPath + key;
        } else {
          fullPath = parentView.fullPath + "/" + key;
        }
      } else {
        fullPath = key;
        this.#topLevelDirs.push(fullPath);
      }

      let view: FileView | DirectoryView;
      let mustShowDir: boolean;
      if (typeof contentsOrRecord === "string") {
        view = new this.#FileViewClass(depth, this.#isFileCollapsible, key, fullPath, this.#controllerCallbacks);
        this.#fileToRowMap.set(view.fullPath, view);
        mustShowDir = !this.#fileFilter || this.#fileFilter(fullPath);
      } else {
        view = new this.#DirectoryViewClass(depth, key, fullPath, this.#controllerCallbacks);
        this.#fileToRowMap.set(view.fullPath, view);
        mustShowDir = this.#fillDirectoryView(contentsOrRecord, view);
        if (!this.#fileFilter)
          mustShowDir = true;
      }

      if (mustShowDir) {
        shouldShowSet.add(view);
      }
    }

    if (shouldShowSet.size) {
      for (const view of shouldShowSet) {
        if (parentView)
          parentView.addRow(view);
        else
          this.#treeRowsElement.append(view.rowElement);
      }
    } else if (parentView && this.#fileFilter)
      this.#fileToRowMap.delete(parentView.fullPath, true);

    return shouldShowSet.size > 0;
  }

  showFile(
    fullPath: string
  ): void
  {
    (this.#fileToRowMap.get(fullPath) as FileView).selectFile();
  }

  * descendantFileViews(): IterableIterator<[string, FileView]>
  {
    for (const [fullPath, view] of this.#fileToRowMap.entries()) {
      if (view.rowType === "file")
        yield [fullPath, view];
    }
  }

  addNewPackage(pathToPackage: string): DirectoryView {
    return this.#addNewTopLevel(pathToPackage, false);
  }

  addNewProtocol(pathToProtocol: string): DirectoryView {
    return this.#addNewTopLevel(pathToProtocol, true);
  }

  #addNewTopLevel(pathToFile: string, isProtocol: boolean): DirectoryView {
    const view: DirectoryView = new this.#DirectoryViewClass(0, pathToFile, pathToFile, this.#controllerCallbacks);

    // split between packages and protocols
    let firstProtocol: number = this.#topLevelDirs.findIndex(dir => dir.endsWith("://"));
    if (firstProtocol === -1)
      firstProtocol = this.#topLevelDirs.length;

    let index: number, sublist: readonly string[];
    if (isProtocol) {
      sublist = this.#topLevelDirs.slice(firstProtocol);
    } else {
      sublist = this.#topLevelDirs.slice(0, firstProtocol);
    }

    // find the insertion index
    // binary search would probably not be faster in this case: not enough rows to justify it
    index = sublist.findIndex(currentDir => currentDir.localeCompare(pathToFile) > 0);
    if (isProtocol) {
      if (index === -1)
        index = this.#topLevelDirs.length;
      else
        index += firstProtocol;
    } else {
      if (index === -1)
        index = firstProtocol;
    }

    // insert the row
    if (index === this.#topLevelDirs.length) {
      this.#treeRowsElement.append(view.rowElement);
    } else {
      const refView: DirectoryView = this.#fileToRowMap.get(this.#topLevelDirs[index]) as DirectoryView;
      refView.rowElement.before(view.rowElement);
    }

    this.#topLevelDirs.splice(index, 0, pathToFile);
    this.#fileToRowMap.set(pathToFile, view);
    return view;
  }

  addNewFile(
    currentDirectory: string,
    leafName: string,
    isDirectory: boolean
  ): FileView | DirectoryView
  {
    const parentRowView = this.getRowView(currentDirectory);
    if (parentRowView.rowType !== "directory") {
      throw new Error("assertion failure: row type must be a directory: " + currentDirectory);
    }

    let pathToFile: string = currentDirectory;
    if (currentDirectory.endsWith("://") === false)
      pathToFile += "/";
    pathToFile += leafName;

    let newRowView: FileView | DirectoryView;
    if (isDirectory) {
      newRowView = new this.#DirectoryViewClass(
        parentRowView.depth + 1, leafName, pathToFile, this.#controllerCallbacks
      );
    } else {
      newRowView = new this.#FileViewClass(
        parentRowView.depth + 1, false, leafName, pathToFile, this.#controllerCallbacks
      );
    }
    parentRowView.insertRowSorted(newRowView);
    this.#fileToRowMap.set(pathToFile, newRowView);
    return newRowView;
  }

  addExistingFileEntries(
    currentDirectory: string,
    leafName: string,
    newRecord: DirectoryRecord | null
  ): void
  {
    const isDirectory: boolean = Boolean(newRecord);
    const row: FileView | DirectoryView = this.addNewFile(currentDirectory, leafName, isDirectory);
    if (newRecord) {
      this.#fillDirectoryView(newRecord, row as DirectoryView);
    }
  }

  deleteFile(
    pathToFile: string
  ): void
  {
    const currentRow: DirectoryView | FileView = this.#fileToRowMap.get(pathToFile)!;
    this.#fileToRowMap.delete(pathToFile, true);
    currentRow.removeAndDispose();
  }

  renameFile(
    parentPath: string,
    oldLeafName: string,
    newLeafName: string,
  ): void
  {
    this.#fileToRowMap.rename(parentPath, oldLeafName, newLeafName);
  }
}
