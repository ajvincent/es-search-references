import { OrderedStringMap } from "../utilities/OrderedStringMap.js";
import { WebFSFileType } from "./constants.js";
export class WebFSParentNode {
    #children = new OrderedStringMap;
    children = this.#children;
    insertChild(childEntry) {
        if (this.#children.has(childEntry.localName)) {
            throw new Error("child entry already set: " + childEntry.localName);
        }
        this.#children.set(childEntry.localName, childEntry);
        childEntry.parentFileEntry = this;
        if (childEntry.fileType === WebFSFileType.FILE)
            childEntry.root = this.root;
        this.root.childInserted(childEntry);
    }
    removeChild(childEntry) {
        if (!this.#children.has(childEntry.localName)) {
            throw new Error("child entry not set: " + childEntry.localName);
        }
        this.#children.delete(childEntry.localName);
        childEntry.parentFileEntry = undefined;
        this.root.childRemoved(childEntry);
    }
    renameChild(childEntry, newName) {
        if (!this.#children.has(childEntry.localName)) {
            throw new Error("child entry not set: " + childEntry.localName);
        }
        this.#children.delete(childEntry.localName);
        childEntry.localName = newName;
        this.#children.set(newName, childEntry);
        this.root.childRenamed(childEntry);
    }
}
