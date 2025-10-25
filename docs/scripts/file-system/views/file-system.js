export class FileSystemView {
    #isFileCollapsible;
    #fileToRowMap = new Map;
    #treeRowsElement;
    #DirectoryViewClass;
    #FileViewClass;
    #fileFilter;
    #controllerCallbacks;
    constructor(DirectoryViewClass, FileViewClass, isFileCollapsible, treeRowsElement, initialIndex, fileFilter, controllerCallbacks) {
        this.#DirectoryViewClass = DirectoryViewClass;
        this.#FileViewClass = FileViewClass;
        this.#isFileCollapsible = isFileCollapsible;
        this.#treeRowsElement = treeRowsElement;
        this.#fileFilter = fileFilter;
        this.#controllerCallbacks = controllerCallbacks;
        this.#fillDirectoryView(initialIndex, null);
    }
    hasRowView(key) {
        return this.#fileToRowMap.has(key);
    }
    getRowView(key) {
        const view = this.#fileToRowMap.get(key);
        if (!view)
            throw new Error("no view found with that key!");
        return view;
    }
    clearRowMap() {
        for (const row of this.#fileToRowMap.values())
            row.removeAndDispose();
        this.#fileToRowMap.clear();
    }
    #fillDirectoryView(parentRecord, parentView) {
        const depth = parentView ? parentView.depth + 1 : 0;
        const shouldShowSet = new Set;
        for (const [key, contentsOrRecord] of Object.entries(parentRecord)) {
            let fullPath;
            if (parentView) {
                if (parentView.fullPath.endsWith("/")) {
                    fullPath = parentView.fullPath + key;
                }
                else {
                    fullPath = parentView.fullPath + "/" + key;
                }
            }
            else {
                fullPath = key;
            }
            let view;
            let mustShowDir;
            if (typeof contentsOrRecord === "string") {
                view = new this.#FileViewClass(depth, this.#isFileCollapsible, key, fullPath, this.#controllerCallbacks);
                mustShowDir = !this.#fileFilter || this.#fileFilter(fullPath);
            }
            else {
                view = new this.#DirectoryViewClass(depth, key, fullPath, this.#controllerCallbacks);
                mustShowDir = this.#fillDirectoryView(contentsOrRecord, view);
            }
            if (mustShowDir) {
                shouldShowSet.add(view);
            }
        }
        if (shouldShowSet.size) {
            for (const view of shouldShowSet) {
                this.#fileToRowMap.set(view.fullPath, view);
                if (parentView)
                    parentView.addRow(view);
                else
                    this.#treeRowsElement.append(view.rowElement);
            }
        }
        return shouldShowSet.size > 0;
    }
    showFile(fullPath) {
        this.#fileToRowMap.get(fullPath).selectFile(fullPath);
    }
    *descendantFileViews() {
        for (const [fullPath, view] of this.#fileToRowMap.entries()) {
            if (view instanceof this.#FileViewClass)
                yield [fullPath, view];
        }
    }
}
