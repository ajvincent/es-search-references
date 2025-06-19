import { OrderedStringMap } from "../utilities/OrderedStringMap.js";
import { WebFSFileType } from "./constants.js";
import { WebFSFile } from "./WebFSFile.js";
export class WebFSParentNode {
    /*
    protected static reviveFromJSON(parent: WebFSParentNode, value: Record<string, WebFSFileEntryIfc>): void {
      const entries: readonly (readonly [string, WebFSFileEntryIfc])[] = Object.entries(value);
  
      for (const [localName, fileEntry] of entries) {
        parent.#children.set(localName, fileEntry);
      }
    }
  
    protected static reviveFromZippable(parent: WebFSParentNode, value: ZippableDirectories): void {
      const entries: readonly (readonly [string, ZippableFileEntry])[] = Object.entries(value);
  
      for (const [localName, zippableEntry] of entries) {
        let childEntry: WebFSFileEntryIfc;
  
        if (zippableEntry instanceof Uint8Array)
          childEntry = WebFSFile.fromZippable(zippableEntry);
        else
          childEntry = WebFSDirectory.fromZippable(zippableEntry);
  
        parent.#children.set(localName, childEntry);
      }
    }
    */
    #children = new OrderedStringMap;
    children = this.#children;
    addFileDeep(pathSequence, pathIndex, contents) {
        const childName = pathSequence[pathIndex];
        let child = this.#children.get(childName);
        if (pathIndex === pathSequence.length - 1) {
            // base case
            if (child) {
                throw new Error("file already exists: " + pathSequence.join("/"));
            }
            child = new WebFSFile(contents);
            this.#children.set(childName, child);
            return;
        }
        if (child?.fileType === WebFSFileType.FILE) {
            throw new Error("file exists at path: " + pathSequence.slice(0, pathIndex + 1).join("/"));
        }
        if (!child) {
            child = new WebFSDirectory();
            this.#children.set(childName, child);
        }
        child.addFileDeep(pathSequence, pathIndex + 1, contents);
    }
    addDirectoryDeep(pathSequence, pathIndex) {
        const childName = pathSequence[pathIndex];
        let child = this.#children.get(childName);
        if (child?.fileType === WebFSFileType.FILE) {
            throw new Error("file exists at path: " + pathSequence.slice(0, pathIndex + 1).join("/"));
        }
        if (!child) {
            child = new WebFSDirectory;
            this.#children.set(childName, child);
        }
        if (pathIndex < pathSequence.length - 1)
            child.addDirectoryDeep(pathSequence, pathIndex + 1);
    }
    removeFileDeep(pathSequence, pathIndex) {
        const childName = pathSequence[pathIndex];
        let child = this.#children.get(childName);
        if (!child) {
            throw new Error("path does not exist: " + pathSequence.slice(0, pathIndex + 1));
        }
        if (pathIndex === pathSequence.length - 1) {
            this.#children.delete(childName);
            return child;
        }
        if (child.fileType === WebFSFileType.FILE) {
            throw new Error("path is a file: " + pathSequence.slice(0, pathIndex + 1));
        }
        return child.removeFileDeep(pathSequence, pathIndex + 1);
    }
    getFileDeep(pathSequence, pathIndex) {
        const childName = pathSequence[pathIndex];
        let child = this.#children.get(childName);
        if (!child) {
            throw new Error("path does not exist: " + pathSequence.slice(0, pathIndex + 1));
        }
        if (pathIndex === pathSequence.length - 1) {
            return child;
        }
        if (child.fileType === WebFSFileType.FILE) {
            throw new Error("path is a file: " + pathSequence.slice(0, pathIndex + 1));
        }
        return child.getFileDeep(pathSequence, pathIndex + 1);
    }
    *getWebFileContentsDeep(thisName) {
        for (const [localName, fileEntry] of this.#getWebFileContentsDeep()) {
            if (thisName) {
                yield [thisName + "/" + localName, fileEntry];
            }
            else {
                yield [localName, fileEntry];
            }
        }
    }
    *#getWebFileContentsDeep() {
        for (const [localName, fileEntry] of this.#children.entries()) {
            if (fileEntry.fileType === WebFSFileType.FILE) {
                yield [localName, fileEntry.contents];
            }
            else {
                yield* fileEntry.getWebFileContentsDeep(localName);
            }
        }
    }
    /*
    toJSON(): Record<string, WebFSFileEntryIfc> {
      return Object.fromEntries(this.#children);
    }
  
    toZippable(): ZippableDirectories {
      const entries: [string, ZippableFileEntry][] = [];
  
      for (const [localName, fileEntry] of this.#children.entries()) {
        entries.push([localName, fileEntry.toZippable()]);
      }
  
      return Object.fromEntries(entries);
    }
    */
    adoptChildren(entries) {
        this.#children.clear();
        for (const [key, fileEntry] of entries) {
            this.#children.set(key, fileEntry);
        }
    }
}
export class WebFSDirectory extends WebFSParentNode {
    /*
    static fromJSON(value: Record<string, WebFSFileEntryIfc>): WebFSDirectoryIfc {
      const newDir = new WebFSDirectory();
      WebFSParentNode.reviveFromJSON(newDir, value);
      return newDir;
    }
  
    static fromZippable(value: ZippableDirectories): WebFSDirectoryIfc {
      const newDir = new WebFSDirectory();
      WebFSDirectory.reviveFromZippable(newDir, value);
      return newDir;
    }
    */
    fileType = WebFSFileType.DIR;
}
/*
WebFSDirectory satisfies WebFSParentNodeStaticIfc<WebFSFileType.DIR>;
*/
