import {
  ReportSelectorElement
} from "./elements/report-selector.js";

import {
  BaseDirectoryRowView
} from "../file-system/views/base-directory-row.js";

import {
  BaseFileRowView
} from "../file-system/views/base-file-row.js";

import {
  FileSystemView
} from "../file-system/views/file-system.js";

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
  readonly #fileSystemView: FileSystemView<BaseDirectoryRowView, BaseFileRowView>;

  constructor(
    rootId: string,
    outputController: OutputController,
  )
  {
    this.#rootElement = document.getElementById(rootId) as ReportSelectorElement;
    this.#fileSystemView = new FileSystemView(
      BaseDirectoryRowView, BaseFileRowView, true, this.#rootElement.treeRows!
    );
    this.#outputController = outputController;
  }

  refreshTree(): void {
    this.#rootElement.treeRows!.replaceChildren();
    this.#fileSystemView.clearRowMap();

    const directoriesSet = new Set<string>;

    const fileKeys = Array.from(this.#outputController.filePathsAndSearchKeys.keys());
    fileKeys.sort();
    for (const key of fileKeys) {
      const fileRowView = this.#fileSystemView.addFileKey(key, directoriesSet);

      for (const searchKey of this.#outputController.filePathsAndSearchKeys.get(key)!) {
        this.#addSearchKeyRow(key, searchKey, fileRowView);
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

    view.rowElement!.onclick = this.#handleSearchKeyClick.bind(this, fileKey, searchKey, view);
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
