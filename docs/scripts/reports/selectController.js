import { BaseDirectoryRowView } from "../file-system/views/base-directory-row.js";
import { BaseFileRowView } from "../file-system/views/base-file-row.js";
import { FileSystemView } from "../file-system/views/file-system.js";
import { ReportSelectorElement } from "./elements/report-selector.js";
import { SearchKeyRowView } from "./views/searchKey-row.js";
void (ReportSelectorElement); // force the custom element upgrade
export class ReportSelectController {
    #outputController;
    #rootElement;
    #selectedView;
    #fileSystemView;
    constructor(rootId, outputController) {
        this.#rootElement = document.getElementById(rootId);
        this.#outputController = outputController;
    }
    clear() {
        this.#rootElement.treeRows.replaceChildren();
        this.#fileSystemView?.clearRowMap();
    }
    refreshTree(index) {
        this.clear();
        this.#fileSystemView = new FileSystemView(BaseDirectoryRowView, BaseFileRowView, true, this.#rootElement.treeRows, index, (fullPath) => this.#outputController.filePathsAndSearchKeys.has(fullPath));
        for (const [fullPath, view] of this.#fileSystemView.descendantFileViews()) {
            const searchKeysIterator = this.#outputController.filePathsAndSearchKeys.get(fullPath);
            if (!searchKeysIterator)
                continue;
            for (const searchKey of searchKeysIterator) {
                this.#addSearchKeyRow(fullPath, searchKey, view);
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
