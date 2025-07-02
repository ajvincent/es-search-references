export class ParentChildMap {
    #internalMap = new Map;
    clear() {
        this.#internalMap.clear();
    }
    delete(key) {
        const node = this.#internalMap.get(key);
        if (!node)
            return false;
        if (node.parentKey) {
            this.#internalMap.get(node.parentKey).childKeys.delete(key);
        }
        this.#deleteRecursive(key);
        return true;
    }
    #deleteRecursive(key) {
        const node = this.#internalMap.get(key);
        for (const childKey of node.childKeys) {
            this.#deleteRecursive(childKey);
        }
        this.#internalMap.delete(key);
    }
    forEach(callbackfn, thisArg) {
        this.#internalMap.forEach((node, key) => {
            callbackfn.apply(thisArg, [node.value, key, this]);
        });
    }
    get(key) {
        return this.#internalMap.get(key)?.value;
    }
    has(key) {
        return this.#internalMap.has(key);
    }
    set(key, value, parentKey) {
        const hadNode = this.#internalMap.has(key);
        if (hadNode) {
            if (parentKey !== undefined) {
                throw new Error("cannot set parent key for existing key: " + key);
            }
            this.#internalMap.get(key).value = value;
        }
        else {
            let ancestorKey = parentKey;
            while (ancestorKey) {
                if (ancestorKey === key) {
                    throw new Error(`key ${key} is an ancestor of key ${parentKey}`);
                }
                ancestorKey = this.#internalMap.get(key)?.parentKey;
            }
            const node = new ParentChildNode(value, parentKey);
            this.#internalMap.set(key, node);
        }
        return this;
    }
    get size() {
        return this.#internalMap.size;
    }
    entries() {
        return this[Symbol.iterator]();
    }
    keys() {
        return this.#internalMap.keys();
    }
    *values() {
        for (const node of this.#internalMap.values()) {
            yield node.value;
        }
    }
    *[Symbol.iterator]() {
        for (const [key, node] of this.#internalMap) {
            yield [key, node.value];
        }
    }
    [Symbol.toStringTag] = "ParentChildMap";
}
class ParentChildNode {
    value;
    parentKey;
    childKeys = new Set;
    constructor(value, parentKey) {
        this.value = value;
        this.parentKey = parentKey;
    }
}
