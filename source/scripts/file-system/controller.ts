import {
  FileSystemElement,
 } from "./views/file-system.js";

 import {
  FileTreeRow
} from "./views/tree-row.js";

export interface FileSystemCallbacks {
  fileSelected(pathToFile: string): void;
  fileCheckToggled(pathToFile: string, isChecked: boolean): void;
}

void(FileSystemElement); // force the import

export class FileSystemController {
  #fileMap: ReadonlyMap<string, string> = new Map<string, string>;
  readonly #callbacks: FileSystemCallbacks;

  readonly #view: FileSystemElement;
  readonly #fileToRowMap = new Map<string, FileTreeRow>;

  constructor(
    id: string,
    callbacks: FileSystemCallbacks
  )
  {
    this.#view = document.getElementById(id) as FileSystemElement;
    this.#callbacks = callbacks;
  }

  setFileMap(
    fileMap: ReadonlyMap<string, string>
  ): void
  {
    this.#view.clearRows();
    this.#fileToRowMap.clear();

    this.#fileMap = fileMap;

    const directoriesSet = new Set<string>;
    for (const key of this.#fileMap.keys()) {
      this.#addFileKey(key, directoriesSet);
    }
  }

  #addFileKey(key: string, directoriesSet: Set<string>): void {
    const lastSlash = key.lastIndexOf("/");
    const parent = key.substring(0, lastSlash);
    if (parent && directoriesSet.has(parent) === false) {
      this.#addDirectoryKey(parent, directoriesSet);
    }
    const leaf = key.substring(lastSlash + 1);
    const row: FileTreeRow = this.#view.addRow(parent, leaf, [leaf, key]);

    this.#fileToRowMap.set(key, row);

    row.checkboxElement!.onclick = (ev: MouseEvent): void => {
      ev.stopPropagation();
      this.#callbacks.fileCheckToggled(key, row.checkboxElement!.checked);
    };
    row.radioElement!.onselect = (ev: Event): void => {
      ev.stopPropagation();
      this.#callbacks.fileSelected(key);
    };
  }

  #addDirectoryKey(key: string, directoriesSet: Set<string>): void {
    let lastSlash = key.lastIndexOf("/");
    if (lastSlash === -1)
      lastSlash = 0;
    const parent = key.substring(0, lastSlash);
    if (parent && directoriesSet.has(parent) === false) {
      this.#addDirectoryKey(parent, directoriesSet);
    }
    const leaf = key.substring(lastSlash + 1);
    const row = this.#view.addRow(parent, leaf, [leaf]);
    row.onclick = () => row.toggleCollapsed();
  }
}
