export class FileSystemView {
    #isFileCollapsible;
    #fileToRowMap = new Map;
    #treeRowsElement;
    #DirectoryViewClass;
    #FileViewClass;
    constructor(DirectoryViewClass, FileViewClass, isFileCollapsible, treeRowsElement, initialIndex) {
        this.#DirectoryViewClass = DirectoryViewClass;
        this.#FileViewClass = FileViewClass;
        this.#isFileCollapsible = isFileCollapsible;
        this.#treeRowsElement = treeRowsElement;
        this.fillDirectoryFromTop(initialIndex);
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
    fillDirectoryFromTop(topRecord) {
        for (const [key, contentsOrRecord] of Object.entries(topRecord)) {
            let view;
            if (typeof contentsOrRecord === "string") {
                view = new this.#FileViewClass(0, this.#isFileCollapsible, key, key);
            }
            else {
                view = new this.#DirectoryViewClass(0, key, key);
                this.#fillDirectoryView(contentsOrRecord, view);
            }
            this.#fileToRowMap.set(key, view);
            this.#treeRowsElement.append(view.rowElement);
        }
    }
    #fillDirectoryView(parentRecord, parentView) {
        const depth = parentView.depth + 1;
        for (const [key, contentsOrRecord] of Object.entries(parentRecord)) {
            let fullPath;
            if (parentView.fullPath.endsWith("/")) {
                fullPath = parentView.fullPath + key;
            }
            else {
                fullPath = parentView.fullPath + "/" + key;
            }
            let view;
            if (typeof contentsOrRecord === "string") {
                view = new this.#FileViewClass(depth, this.#isFileCollapsible, key, fullPath);
            }
            else {
                view = new this.#DirectoryViewClass(depth, key, fullPath);
                this.#fillDirectoryView(contentsOrRecord, view);
            }
            this.#fileToRowMap.set(fullPath, view);
            parentView.rowElement.append(view.rowElement);
        }
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
