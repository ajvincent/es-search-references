import { FileSystemUtilities } from "./FSUtilities.js";
export class JSONMap extends Map {
    static async build(fileHandle) {
        const initialText = await FileSystemUtilities.readFile(fileHandle);
        return new JSONMap(fileHandle, initialText);
    }
    #fileHandle;
    constructor(fileHandle, initialText) {
        super();
        this.#fileHandle = fileHandle;
        if (initialText[0] !== "{")
            initialText = "{}";
        const object = JSON.parse(initialText);
        for (const [key, value] of Object.entries(object)) {
            super.set(key, value);
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
        return FileSystemUtilities.writeFile(this.#fileHandle, data);
    }
}
