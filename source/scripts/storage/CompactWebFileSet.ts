import {
  DelayPromise
} from "../utilities/PromiseTypes.js";

import type {
  JSONStorageIfc
} from "./types/JSONStorageIfc.js";

import {
  WebFileFS
} from "./WebFSFile.js";

export class CompactWebFileSet extends Set<WebFileFS> {
  readonly #storage: JSONStorageIfc;
  readonly #systemKey: string;

  #delayPromise: Promise<void> | undefined;

  #contentsEntries: [string, string][] = [];
  #fileToEntry = new WeakMap<WebFileFS, [string, string]>;

  constructor(
    storage: JSONStorageIfc,
    systemKey: string,
    directEntries: readonly (readonly [string, string])[]
  )
  {
    super();
    directEntries.forEach(([fullPath, contents]) => {
      const webFile = new WebFileFS(fullPath, contents, undefined);
      super.add(webFile);
      this.#addFile(webFile);
    });

    this.#storage = storage;
    this.#systemKey = systemKey;
  }

  get contentEntries(): readonly (readonly [string, string])[] {
    return this.#contentsEntries;
  }

  #addFile(webFile: WebFileFS): void {
    const contentEntry: [string, string] = [webFile.fullPath, webFile.contents];
    this.#fileToEntry.set(webFile, contentEntry);
    this.#contentsEntries.push(contentEntry);
  }

  add(webFile: WebFileFS): this {
    const hadFile = super.has(webFile);
    super.add(webFile);

    if (hadFile) {
      const entry: [string, string] = this.#fileToEntry.get(webFile)!;
      entry[0] = webFile.fullPath;
      entry[1] = webFile.contents;
    } else {
      this.#addFile(webFile);
    }

    this.#scheduleUpdate();
    return this;
  }

  clear(): void {
    super.clear();
    this.#contentsEntries = [];
    this.#fileToEntry = new WeakMap;
    this.#scheduleUpdate();
  }

  delete(webFile: WebFileFS): boolean {
    const deleted = super.delete(webFile);
    if (deleted) {
      const fileEntry = this.#fileToEntry.get(webFile)!;
      this.#contentsEntries.splice(this.#contentsEntries.indexOf(fileEntry), 1);
      this.#fileToEntry.delete(webFile);

      this.#scheduleUpdate();
    }
    return deleted;
  }

  #scheduleUpdate(): Promise<void> {
    if (!this.#delayPromise) {
      this.#delayPromise = DelayPromise(0).then(() => {
        this.#delayPromise = undefined;
        if (this.size > 0)
          this.#storage.setItem(this.#systemKey, this.#contentsEntries);
        else
          this.#storage.removeItem(this.#systemKey);
      });
    }

    return this.#delayPromise;
  }

  get delayPromise(): Promise<void> | undefined {
    return this.#delayPromise;
  }
}
