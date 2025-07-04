import { FileSystemUtilities } from "./FSUtilities.js";
export class JSONMap extends Map {
    #fileHandle;
    constructor(fileHandle) {
        super();
        this.#fileHandle = fileHandle;
        let text = FileSystemUtilities.readContents(fileHandle);
        if (text[0] !== "{")
            text = "{}";
        const object = JSON.parse(text);
        this.clear();
        for (const [key, value] of Object.entries(object)) {
            this.set(key, value);
        }
    }
    clear() {
        super.clear();
        this.#commit();
    }
    delete(key) {
        const rv = super.delete(key);
        this.#commit();
        return rv;
    }
    set(key, value) {
        super.set(key, value);
        this.#commit();
        return this;
    }
    #commit() {
        const data = JSON.stringify(Object.fromEntries(this));
        FileSystemUtilities.writeContents(this.#fileHandle, data);
    }
    close() {
        this.#fileHandle.close();
    }
}
