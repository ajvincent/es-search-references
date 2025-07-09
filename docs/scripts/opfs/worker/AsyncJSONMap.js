export class AsyncJSONMap extends Map {
    static async build(fileHandle) {
        const entries = await this.#readMap(fileHandle);
        return new AsyncJSONMap(fileHandle, entries);
    }
    static async #readMap(fileHandle) {
        const file = await fileHandle.getFile();
        let text = await file.text();
        if (text[0] !== "{")
            text = "{}";
        const object = JSON.parse(text);
        return Object.entries(object);
    }
    #fileHandle;
    constructor(fileHandle, entries) {
        super(entries);
        this.#fileHandle = fileHandle;
    }
    async refresh() {
        this.clear();
        for (const [key, value] of await AsyncJSONMap.#readMap(this.#fileHandle)) {
            this.set(key, value);
        }
    }
    async commit() {
        const writable = await this.#fileHandle.createWritable();
        await writable.write(JSON.stringify(Object.fromEntries(this)));
        await writable.close();
    }
}
