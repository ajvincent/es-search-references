import { getParentAndLeaf } from "../../utilities/getParentAndLeaf.js";
export class FileSystemView {
    #isFileCollapsible;
    #fileToRowMap = new Map;
    #treeRowsElement;
    #DirectoryViewClass;
    #FileViewClass;
    constructor(DirectoryViewClass, FileViewClass, isFileCollapsible, treeRowsElement) {
        this.#DirectoryViewClass = DirectoryViewClass;
        this.#FileViewClass = FileViewClass;
        this.#isFileCollapsible = isFileCollapsible;
        this.#treeRowsElement = treeRowsElement;
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
    addFileKey(key, directoriesSet) {
        const [parent, leaf] = getParentAndLeaf(key);
        if (parent && directoriesSet.has(parent) === false) {
            this.#addDirectoryKey(parent, directoriesSet);
        }
        const parentRowView = this.#fileToRowMap.get(parent);
        const view = new this.#FileViewClass(parentRowView.depth + 1, this.#isFileCollapsible, leaf, key);
        this.#fileToRowMap.set(key, view);
        parentRowView.insertRowSorted(view);
        return view;
    }
    #addDirectoryKey(key, directoriesSet) {
        let [parent, leaf] = getParentAndLeaf(key);
        if (parent && directoriesSet.has(parent) === false) {
            this.#addDirectoryKey(parent, directoriesSet);
        }
        let depth;
        if (parent === "") {
            depth = 0;
        }
        else {
            depth = this.#fileToRowMap.get(parent).depth + 1;
        }
        const view = new this.#DirectoryViewClass(depth, leaf, key);
        this.#fileToRowMap.set(key, view);
        if (depth > 0) {
            view.registerCollapseClick();
            this.#fileToRowMap.get(parent).insertRowSorted(view);
        }
        else {
            this.#treeRowsElement.append(view.rowElement);
        }
        directoriesSet.add(key);
    }
    showFile(key) {
        this.#fileToRowMap.get(key).selectFile(key);
    }
}
