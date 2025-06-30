export class JSONMap extends Map {
    static #encoder = new TextEncoder();
    static #decoder = new TextDecoder();
    #fileHandle;
    constructor(fileHandle) {
        super();
        this.#fileHandle = fileHandle;
        this.refresh();
    }
    refresh() {
        const buffer = new Uint8Array();
        this.#fileHandle.read(buffer, { at: 0 });
        let text = JSONMap.#decoder.decode(buffer);
        if (text[0] !== "{")
            text = "{}";
        const object = JSON.parse(text);
        this.clear();
        for (const [key, value] of Object.entries(object)) {
            this.set(key, value);
        }
    }
    commit() {
        this.#fileHandle.truncate(0);
        const data = JSON.stringify(Object.fromEntries(this));
        const buffer = new Uint8Array(JSONMap.#encoder.encode(data));
        this.#fileHandle.write(buffer);
    }
    close() {
        this.#fileHandle.close();
    }
}
