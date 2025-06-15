import { DelayPromise } from "../utilities/PromiseTypes.js";
import { WebFileFS } from "./WebFSFile.js";
export class CompactWebFileSet extends Set {
    #storage;
    #systemKey;
    #delayPromise;
    #contentsEntries = [];
    #fileToEntry = new WeakMap;
    constructor(storage, systemKey, directEntries) {
        super();
        directEntries.forEach(([fullPath, contents]) => {
            const webFile = new WebFileFS(fullPath, contents, undefined);
            super.add(webFile);
            this.#addFile(webFile);
        });
        this.#storage = storage;
        this.#systemKey = systemKey;
    }
    get contentEntries() {
        return this.#contentsEntries;
    }
    #addFile(webFile) {
        const contentEntry = [webFile.fullPath, webFile.contents];
        this.#fileToEntry.set(webFile, contentEntry);
        this.#contentsEntries.push(contentEntry);
    }
    add(webFile) {
        const hadFile = super.has(webFile);
        super.add(webFile);
        if (hadFile) {
            const entry = this.#fileToEntry.get(webFile);
            entry[0] = webFile.fullPath;
            entry[1] = webFile.contents;
        }
        else {
            this.#addFile(webFile);
        }
        this.#scheduleUpdate();
        return this;
    }
    clear() {
        super.clear();
        this.#contentsEntries = [];
        this.#fileToEntry = new WeakMap;
        this.#scheduleUpdate();
    }
    delete(webFile) {
        const deleted = super.delete(webFile);
        if (deleted) {
            const fileEntry = this.#fileToEntry.get(webFile);
            this.#contentsEntries.splice(this.#contentsEntries.indexOf(fileEntry), 1);
            this.#fileToEntry.delete(webFile);
            this.#scheduleUpdate();
        }
        return deleted;
    }
    #scheduleUpdate() {
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
    get delayPromise() {
        return this.#delayPromise;
    }
}
