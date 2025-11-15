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

import {
  ClipboardController
} from "./clipboardController.js";

import {
  FileSystemMap,
} from "./FileSystemMap.js";

import {
  FileSystemContextMenu
} from "./contextMenu.js";

import {
  FSContextMenuShowArguments
} from "./contextMenuShowArguments.js";

import {
  FileSystemElement
} from "./elements/file-system.js";

import type {
  FSContextMenuShowArgumentsIfc
} from "./types/FSContextMenuShowArgumentsIfc.js";

import type {
  FSControllerCallbacksIfc
} from "./types/FSControllerCallbacksIfc.js";

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

export class FileSystemController implements BaseView, FSControllerCallbacksIfc {
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

  readonly #fileToRowMap: FileSystemMap<DirectoryRowView | FileRowView>;
  readonly #fileSystemView: FileSystemView<DirectoryRowView, FileRowView>;
  readonly #clipboardController: ClipboardController;

  readonly editorMapView: FileEditorMapView;
  readonly #fsContextMenu: FileSystemContextMenu;

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

    this.#fsContextMenu = new FileSystemContextMenu(this);

    const fileToRowMap = new FileSystemMap<DirectoryRowView | FileRowView>(0);
    this.#fileToRowMap = fileToRowMap;
    this.#fileSystemView = new FileSystemView(
      DirectoryRowView, FileRowView, false, this.displayElement.treeRows!,
      index, fileToRowMap, undefined, this
    );
    for (const [fullPath, fileView] of this.#fileSystemView.descendantFileViews()) {
      this.#addFileEventHandlers(fullPath, fileView);
    }
    this.#clipboardController = new ClipboardController(fileSystemElement, webFS);

    this.editorMapView = new FileEditorMapView(rootId, isReadonly, codeMirrorPanelsElement, webFS);
  }

  dispose(): void {
    this.displayElement.remove();
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
    view.checkboxElement!.onclick = (ev: MouseEvent): void => {
      this.#fileCheckToggled(fullPath, view.checkboxElement!.checked);
    };
    view.radioElement!.onclick = (ev: Event): void => {
      this.#selectFile(fullPath, ev);
    };

    view.rowElement!.onclick = (ev: MouseEvent): void => {
      ev.stopPropagation();
    }
  }

  async #selectFile(
    fullPath: string,
    event?: Event
  ): Promise<void>
  {
    if (event) {
      event.stopPropagation();
    }

    await this.editorMapView.updateSelectedFile();

    if (!this.editorMapView.hasEditorForPath(fullPath)) {
      const forceReadonly: boolean = fullPath.startsWith(ClipboardController.rowName);
      await this.editorMapView.addEditorForPath(fullPath, forceReadonly);
    }
    this.editorMapView.selectFile(fullPath);
  }

  async getWebFilesMap(): Promise<ReadonlyMap<string, string>>
  {
    const record: Record<string, string> = await this.#webFS.getWebFilesRecord();
    return new Map(Object.entries(record));
  }

  getWebFilesIndex(): Promise<DirectoryRecord>
  {
    return this.#webFS.getIndex();
  }

  showFileAndLineNumber(
    specifier: string,
    lineNumber: number
  ): void
  {
    this.#fileSystemView.showFile(specifier);
    this.editorMapView!.scrollToLine(lineNumber);
  }

  async updateSelectedFile(): Promise<void> {
    return this.editorMapView.updateSelectedFile();
  }

  // FileSystemControllerIfc
  getTreeRowsElement(): HTMLElement {
    return this.displayElement.treeRows!;
  }

  // FileSystemControllerIfc
  get clipBoardHasCopy(): boolean {
    return this.#clipboardController.clipboardHasCopy;
  }

  // FileSystemControllerIfc
  async showFSContextMenu(
    event: MouseEvent,
    pathToFile: string,
    isDirectory: boolean
  ): Promise<void>
  {
    event.stopPropagation();
    event.preventDefault();

    const showArgsPromise = new FSContextMenuShowArguments(event, pathToFile, isDirectory, this.#webFS);
    const showArgs: FSContextMenuShowArgumentsIfc = await showArgsPromise.promise;

    this.#fsContextMenu.show(showArgs);
  }

  // FileSystemControllerIfc
  async addNewFile(
    currentDirectory: string,
    leafName: string,
    isDirectory: boolean
  ): Promise<void>
  {
    let pathToFile: string = currentDirectory;
    if (currentDirectory.endsWith("://") === false)
      pathToFile += "/";
    pathToFile += leafName;

    if (isDirectory) {
      await this.#webFS.createDirDeep(pathToFile);
    } else {
      await this.#webFS.writeFileDeep(pathToFile, "");
    }

    const newRowView: FileRowView | DirectoryRowView = this.#fileSystemView.addNewFile(
      currentDirectory, leafName, isDirectory
    );

    if (newRowView instanceof FileRowView) {
      this.#addFileEventHandlers(pathToFile, newRowView);
    }
    this.#fileSystemView.showFile(pathToFile);
  }

  // FileSystemControllerIfc
  async addPackage(packageName: string): Promise<void> {
    await this.#webFS.createDirDeep(packageName);
    this.#fileSystemView.addNewPackage(packageName);
  }

  // FileSystemControllerIfc
  async addProtocol(protocolName: `${string}://`): Promise<void> {
    await this.#webFS.createDirDeep(protocolName);
    this.#fileSystemView.addNewProtocol(protocolName);
  }

  // FileSystemControllerIfc
  async deleteFile(
    pathToFile: string
  ): Promise<void>
  {
    await this.#webFS.removeEntryDeep(pathToFile);
    this.#fileSystemView.deleteFile(pathToFile);
    this.editorMapView.clearPanels();
  }

  // FileSystemControllerIfc
  async renameFile(
    currentPathToFile: string,
    newLeafName: string
  ): Promise<void>
  {
    const parentPath: string = FileSystemMap.getParentPath(currentPathToFile);
    const oldLeafName: string = currentPathToFile.substring(parentPath.length + 1);

    await this.#webFS.copyEntryDeep(parentPath, oldLeafName, newLeafName);
    await this.#webFS.removeEntryDeep(currentPathToFile);

    this.#fileSystemView.renameFile(
      parentPath,
      oldLeafName,
      newLeafName
    );
    this.editorMapView.clearPanels();
  }

  // FileSystemControllerIfc
  async copyToClipboard(
    pathToFile: string,
    isCut: boolean
  ): Promise<void>
  {
    await this.#webFS.copyToClipboard(pathToFile);
    if (isCut) {
      await this.#webFS.removeEntryDeep(pathToFile);
      this.#fileSystemView.deleteFile(pathToFile);
    }

    await this.rebuildClipboard();
    this.editorMapView.clearPanels();
  }

  async rebuildClipboard(): Promise<void> {
    await this.#clipboardController.rebuild();

    const iterator: IterableIterator<
      [string, FileRowView]
    > = this.#clipboardController.fileSystemView.descendantFileViews();

    for (const [fullPath, fileView] of iterator) {
      this.#addFileEventHandlers(fullPath, fileView);
    }
  }

  async copyFromClipboard(
    currentDirectory: string,
    leafName: string,
    isDirectory: boolean,
  ): Promise<void>
  {
    await this.#webFS.copyFromClipboard(currentDirectory);
    let pathToFile: string = currentDirectory;
    if (currentDirectory.endsWith("://") === false)
      pathToFile += "/";
    pathToFile += leafName;

    let newRecord: DirectoryRecord | null = null;
    if (isDirectory)
      newRecord = await this.#webFS.getDescendantIndex(pathToFile);

    this.#fileToRowMap.copyFrom(
      this.#clipboardController.fileToRowMap,
      leafName,
      currentDirectory,
      leafName
    );

    this.#fileSystemView.addExistingFileEntries(
      currentDirectory, leafName, newRecord
    );
  }
}
