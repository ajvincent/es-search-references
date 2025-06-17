export class WeakRefSet {
    #valueToRef = new WeakMap();
    #references = new Set;
    #callback = (ref) => this.#references.delete(ref);
    #finalizer = new FinalizationRegistry(this.#callback);
    addReference(value) {
        let ref = this.#valueToRef.get(value);
        if (!ref) {
            ref = new WeakRef(value);
            this.#valueToRef.set(value, ref);
            this.#finalizer.register(value, ref, ref);
            this.#references.add(ref);
        }
    }
    hasReference(value) {
        return this.#valueToRef.has(value);
    }
    deleteReference(value) {
        const ref = this.#valueToRef.get(value);
        if (!ref)
            return false;
        this.#valueToRef.delete(value);
        this.#references.delete(ref);
        this.#finalizer.unregister(ref);
        return true;
    }
    *liveElements() {
        for (const ref of this.#references.values()) {
            const value = ref.deref();
            if (value)
                yield value;
            else {
                this.#references.delete(ref);
                this.#finalizer.unregister(ref);
            }
        }
    }
    clearReferences() {
        this.#valueToRef = new WeakMap();
        this.#references = new Set;
        this.#finalizer = new FinalizationRegistry(this.#callback);
    }
}
