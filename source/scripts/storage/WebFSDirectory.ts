import {
  OrderedStringMap
} from "../utilities/OrderedStringMap.js";

import {
  WebFSFileType
} from "./constants.js";

import type {
  WebFSDirectoryIfc,
  WebFSFileEntryIfc,
  WebFSFileIfc,
  WebFSParentNodeIfc,
  /*
  WebFSParentNodeStaticIfc,
  ZippableDirectories,
  ZippableFileEntry,
  */
} from "./types/WebFileSystem.js";

import {
  WebFSFile
} from "./WebFSFile.js";

export abstract class WebFSParentNode implements WebFSParentNodeIfc {
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

  readonly #children = new OrderedStringMap<WebFSFileEntryIfc>;
  readonly children: ReadonlyMap<string, WebFSFileEntryIfc> = this.#children;

  readonly abstract fileType: WebFSFileType.DIR | WebFSFileType.PACKAGE | WebFSFileType.URL;

  public addFileDeep(pathSequence: readonly string[], pathIndex: number, contents: string): void {
    const childName = pathSequence[pathIndex];
    let child: WebFSFileEntryIfc | undefined = this.#children.get(childName);

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

  public addDirectoryDeep(pathSequence: readonly string[], pathIndex: number): void {
    const childName = pathSequence[pathIndex];
    let child: WebFSFileEntryIfc | undefined = this.#children.get(childName);
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

  removeFileDeep(pathSequence: readonly string[], pathIndex: number): WebFSFileIfc | WebFSDirectoryIfc {
    const childName = pathSequence[pathIndex];
    let child: WebFSFileEntryIfc | undefined = this.#children.get(childName);
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

  getFileDeep(pathSequence: readonly string[], pathIndex: number): WebFSFileEntryIfc {
    const childName = pathSequence[pathIndex];
    let child: WebFSFileEntryIfc | undefined = this.#children.get(childName);
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

  * getWebFileContentsDeep(thisName: string): Iterable<[string, string]> {
    for (const [localName, fileEntry] of this.#getWebFileContentsDeep()) {
      if (thisName) {
        yield [thisName + "/" + localName, fileEntry];
      }
      else {
        yield [localName, fileEntry];
      }
    }
  }

  * #getWebFileContentsDeep(): Iterable<[string, string]> {
    for (const [localName, fileEntry] of this.#children.entries()) {
      if (fileEntry.fileType === WebFSFileType.FILE) {
        yield [localName, fileEntry.contents];
      } else {
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

  protected adoptChildren(entries: [string, WebFSFileEntryIfc][]): void {
    this.#children.clear();
    for (const [key, fileEntry] of entries) {
      this.#children.set(key, fileEntry);
    }
  }
}

export class WebFSDirectory extends WebFSParentNode implements WebFSDirectoryIfc {
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

  readonly fileType = WebFSFileType.DIR;
}
/*
WebFSDirectory satisfies WebFSParentNodeStaticIfc<WebFSFileType.DIR>;
*/
