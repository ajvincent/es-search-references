import { ReportSelectorElement } from "./elements/report-selector.js";
import { BaseDirectoryRowView } from "../file-system/views/base-directory-row.js";
import { BaseFileRowView } from "../file-system/views/base-file-row.js";
import { FileSystemView } from "../file-system/views/file-system.js";
import { SearchKeyRowView } from "./views/searchKey-row.js";
void (ReportSelectorElement); // force the custom element upgrade
export class ReportSelectController {
    #outputController;
    #rootElement;
    #selectedView;
    #fileSystemView;
    constructor(rootId, outputController) {
        this.#rootElement = document.getElementById(rootId);
        this.#fileSystemView = new FileSystemView(BaseDirectoryRowView, BaseFileRowView, true, this.#rootElement.treeRows);
        this.#outputController = outputController;
    }
    refreshTree() {
        this.#rootElement.treeRows.replaceChildren();
        this.#fileSystemView.clearRowMap();
        const directoriesSet = new Set;
        const fileKeys = Array.from(this.#outputController.filePathsAndSearchKeys.keys());
        fileKeys.sort();
        for (const key of fileKeys) {
            const fileRowView = this.#fileSystemView.addFileKey(key, directoriesSet);
            for (const searchKey of this.#outputController.filePathsAndSearchKeys.get(key)) {
                this.#addSearchKeyRow(key, searchKey, fileRowView);
            }
        }
    }
    #addSearchKeyRow(fileKey, searchKey, fileRowView) {
        const view = new SearchKeyRowView(fileRowView.depth + 1, searchKey);
        fileRowView.addRow(view);
        view.rowElement.onclick = this.#handleSearchKeyClick.bind(this, fileKey, searchKey, view);
    }
    #handleSearchKeyClick(fileKey, searchKey, view, event) {
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
