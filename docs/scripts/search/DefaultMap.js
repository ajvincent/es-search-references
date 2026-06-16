export class DefaultMap extends Map {
    #builder;
    constructor(builder) {
        super();
        this.#builder = builder;
    }
    getDefault(key) {
        const hasKey = this.has(key);
        if (!hasKey) {
            this.set(key, this.#builder());
        }
        return this.get(key);
    }
}
