export class DefaultMap extends Map {
    #builder;
    constructor(builder) {
        super();
        this.#builder = builder;
    }
    getDefault(key) {
        let value = this.get(key);
        if (!value) {
            value = this.#builder();
            this.set(key, value);
        }
        return value;
    }
}
