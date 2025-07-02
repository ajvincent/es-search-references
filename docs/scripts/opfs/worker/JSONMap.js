var _a;
export class JSONMap extends Map {
    static #encoder = new TextEncoder();
    static #decoder = new TextDecoder();
    #fileHandle;
    constructor(fileHandle) {
        super();
        this.#fileHandle = fileHandle;
        const buffer = new Uint8Array();
        this.#fileHandle.read(buffer, { at: 0 });
        let text = _a.#decoder.decode(buffer);
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
        this.#fileHandle.truncate(0);
        const data = JSON.stringify(Object.fromEntries(this));
        const buffer = new Uint8Array(_a.#encoder.encode(data));
        this.#fileHandle.write(buffer, { at: 0 });
    }
    close() {
        this.#fileHandle.close();
    }
}
_a = JSONMap;
