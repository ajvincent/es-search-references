var _a;
export class FileSystemView {
    static #getParentAndLeaf(key) {
        if (key === "virtual:/") {
            return ["", "virtual://"];
        }
        let lastSlash = key.lastIndexOf("/");
        if (lastSlash === -1) {
            return ["", key];
        }
        const parent = key.substring(0, lastSlash);
        const leaf = key.substring(lastSlash + 1);
        return [parent, leaf];
    }
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
    clearRowMap() {
        this.#fileToRowMap.clear();
    }
    addFileKey(key, directoriesSet) {
        const [parent, leaf] = _a.#getParentAndLeaf(key);
        if (parent && directoriesSet.has(parent) === false) {
            this.#addDirectoryKey(parent, directoriesSet);
        }
        const parentRowView = this.#fileToRowMap.get(parent);
        const view = new this.#FileViewClass(parentRowView.depth + 1, this.#isFileCollapsible, leaf, key);
        this.#fileToRowMap.set(key, view);
        parentRowView.addRow(view);
        return view;
    }
    #addDirectoryKey(key, directoriesSet) {
        let [parent, leaf] = _a.#getParentAndLeaf(key);
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
        const view = new this.#DirectoryViewClass(depth, leaf);
        this.#fileToRowMap.set(key, view);
        if (depth > 0) {
            view.registerCollapseClick();
            this.#fileToRowMap.get(parent).addRow(view);
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
_a = FileSystemView;
