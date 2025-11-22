import {
  FileSystemMap
} from "../file-system/FileSystemMap.js";

import {
  BaseDirectoryRowView
} from "../file-system/views/base-directory-row.js";

import {
  BaseFileRowView
} from "../file-system/views/base-file-row.js";

import {
  FileSystemView
} from "../file-system/views/file-system.js";

import type {
  DirectoryRecord,
} from "../opfs/types/WebFileSystemIfc.js";

import {
  ReportSelectorElement
} from "./elements/report-selector.js";

import {
  SearchKeyRowView
} from "./views/searchKey-row.js";

import type {
  OutputController
} from "./outputController.js";

void(ReportSelectorElement); // force the custom element upgrade

export class ReportSelectController {
  readonly #outputController: OutputController;
  readonly #rootElement: ReportSelectorElement;

  #selectedView: SearchKeyRowView | undefined;
  #fileSystemView?: FileSystemView<BaseDirectoryRowView, BaseFileRowView>;

  constructor(
    rootId: string,
    outputController: OutputController,
  )
  {
    this.#rootElement = document.getElementById(rootId) as ReportSelectorElement;
    this.#outputController = outputController;
  }

  clear(): void {
    this.#rootElement.treeRows!.replaceChildren();
    this.#fileSystemView?.clearRowMap();
  }

  refreshTree(
    index: DirectoryRecord
  ): void
  {
    this.clear();
    const map = new FileSystemMap<BaseDirectoryRowView | BaseFileRowView>(0);
    this.#fileSystemView = new FileSystemView(
      BaseDirectoryRowView, BaseFileRowView, true, this.#rootElement.treeRows!, index, map,
      (fullPath: string) => this.#outputController.filePathsAndSearchKeys.has(fullPath)
    );

    for (const [fullPath, view] of this.#fileSystemView.descendantFileViews()) {
      const searchKeysIterator = this.#outputController.filePathsAndSearchKeys.get(fullPath);
      if (!searchKeysIterator)
        continue;
      for (const searchKey of searchKeysIterator) {
        this.#addSearchKeyRow(fullPath, searchKey, view);
      }
    }
  }

  #addSearchKeyRow(
    fileKey: string,
    searchKey: string,
    fileRowView: BaseFileRowView
  ): void
  {
    const view = new SearchKeyRowView(fileRowView.depth + 1, searchKey);
    fileRowView.addRow(view);

    view.rowElement.onclick = this.#handleSearchKeyClick.bind(this, fileKey, searchKey, view);
  }

  #handleSearchKeyClick(
    fileKey: string,
    searchKey: string,
    view: SearchKeyRowView,
    event: MouseEvent
  ): void
  {
    event.preventDefault();
    event.stopPropagation();

    if (this.#selectedView === view)
      return;

    if (this.#selectedView) {
      this.#selectedView.clearSelected();
      this.#selectedView = undefined;
    }

    this.#selectedView = view;
    this.#selectedView.setSelected();

    this.#outputController.selectFileAndSearchKey(fileKey, searchKey);
  }
}
