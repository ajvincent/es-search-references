export class FileSystemView {
    #isFileCollapsible;
    #fileToRowMap = new Map;
    #topLevelDirs = [];
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
            throw new Error("no view found with the key: " + key);
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
                this.#topLevelDirs.push(fullPath);
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
                if (!this.#fileFilter)
                    mustShowDir = true;
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
        this.#fileToRowMap.get(fullPath).selectFile();
    }
    *descendantFileViews() {
        for (const [fullPath, view] of this.#fileToRowMap.entries()) {
            if (view instanceof this.#FileViewClass)
                yield [fullPath, view];
        }
    }
    addNewPackage(pathToPackage) {
        return this.#addNewTopLevel(pathToPackage, false);
    }
    addNewProtocol(pathToProtocol) {
        return this.#addNewTopLevel(pathToProtocol, true);
    }
    #addNewTopLevel(pathToFile, isProtocol) {
        const view = new this.#DirectoryViewClass(0, pathToFile, pathToFile, this.#controllerCallbacks);
        // split between packages and protocols
        let firstProtocol = this.#topLevelDirs.findIndex(dir => dir.endsWith("://"));
        if (firstProtocol === -1)
            firstProtocol = this.#topLevelDirs.length;
        let index, sublist;
        if (isProtocol) {
            sublist = this.#topLevelDirs.slice(firstProtocol);
        }
        else {
            sublist = this.#topLevelDirs.slice(0, firstProtocol);
        }
        // find the insertion index
        // binary search would probably not be faster in this case: not enough rows to justify it
        index = sublist.findIndex(currentDir => currentDir.localeCompare(pathToFile) > 0);
        if (isProtocol) {
            if (index === -1)
                index = this.#topLevelDirs.length;
            else
                index += firstProtocol;
        }
        else {
            if (index === -1)
                index = firstProtocol;
        }
        // insert the row
        if (index === this.#topLevelDirs.length) {
            this.#treeRowsElement.append(view.rowElement);
        }
        else {
            const refView = this.#fileToRowMap.get(this.#topLevelDirs[index]);
            refView.rowElement.before(view.rowElement);
        }
        this.#topLevelDirs.splice(index, 0, pathToFile);
        this.#fileToRowMap.set(pathToFile, view);
        return view;
    }
    addFile(currentDirectory, leafName, isDirectory) {
        const parentRowView = this.getRowView(currentDirectory);
        if (parentRowView.rowType !== "directory") {
            throw new Error("assertion failure: row type must be a directory: " + currentDirectory);
        }
        let pathToFile = currentDirectory;
        if (currentDirectory.endsWith("://") === false)
            pathToFile += "/";
        pathToFile += leafName;
        let newRowView;
        if (isDirectory) {
            newRowView = new this.#DirectoryViewClass(parentRowView.depth + 1, leafName, pathToFile, this.#controllerCallbacks);
        }
        else {
            newRowView = new this.#FileViewClass(parentRowView.depth + 1, false, leafName, pathToFile, this.#controllerCallbacks);
        }
        parentRowView.insertRowSorted(newRowView);
        this.#fileToRowMap.set(pathToFile, newRowView);
        return newRowView;
    }
}
