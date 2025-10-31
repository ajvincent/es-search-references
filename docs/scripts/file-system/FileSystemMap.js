var _a;
import WeakStrongMap from "../utilities/WeakStrongMap.js";
const UNIQUE_KEY = Symbol("unique filepath key");
const COPY_TRAVERSE_MAP = Symbol("traverse map for copy");
export class FileSystemMap {
    //#region statics
    static #getPathSequence(pathToEntry) {
        if (URL.canParse(pathToEntry)) {
            const { protocol, hostname, pathname } = URL.parse(pathToEntry);
            return [protocol + "//", hostname, ...pathname.substring(1).split("/")].filter(Boolean);
        }
        if (pathToEntry == "")
            throw new Error("empty paths are not allowed");
        return pathToEntry.split("/");
    }
    static #joinPaths(parentPath, leafName) {
        if (parentPath === "" || parentPath.endsWith("://"))
            return parentPath + leafName;
        return parentPath + "/" + leafName;
    }
    static #fileEntryComparator(a, b) {
        return a[0].localeCompare(b[0]);
    }
    static #topLevelEntryComparator(a, b) {
        const keyA = a[0], keyB = b[0];
        const aIsProtocol = keyA.endsWith("://"), bIsProtocol = keyB.endsWith("://");
        if (aIsProtocol && !bIsProtocol)
            return +1;
        if (!aIsProtocol && bIsProtocol)
            return -1;
        return keyA.localeCompare(keyB);
    }
    //#endregion statics
    //#region internals
    [UNIQUE_KEY] = 0;
    #uniqueCounter = 1;
    #descendantsMap = new WeakStrongMap();
    #fileDataMap = new WeakMap;
    #createNewKey() {
        return {
            [UNIQUE_KEY]: this.#uniqueCounter++
        };
    }
    #getPathQueue(sequence, mustCreate) {
        const stack = [this];
        let currentObject = this;
        for (let i = 0; i < sequence.length; i++) {
            const localName = sequence[i];
            let nextKey = this.#descendantsMap.get(currentObject, localName);
            if (nextKey === undefined) {
                if (mustCreate && i === sequence.length - 1) {
                    nextKey = this.#createNewKey();
                    this.#descendantsMap.set(currentObject, localName, nextKey);
                }
                else {
                    return undefined;
                }
            }
            stack.push(nextKey);
            currentObject = nextKey;
        }
        return stack;
    }
    //#endregion internals
    //#region standard Map API's
    clear() {
        this.#descendantsMap = new WeakStrongMap;
        this.#fileDataMap = new WeakMap;
    }
    delete(key, forceRecursive) {
        const sequence = _a.#getPathSequence(key);
        const stack = this.#getPathQueue(sequence, false);
        if (!stack)
            return false;
        const lastKey = stack.at(-1);
        if (!forceRecursive && this.#descendantsMap.hasStrongKeys(lastKey)) {
            throw new Error(`There are descendants of "${key}".  Use forceRecursive to clear them all out.`);
        }
        if (!this.#fileDataMap.delete(lastKey))
            return false;
        const parentKey = stack[sequence.length - 1];
        const localName = sequence.at(-1);
        this.#descendantsMap.delete(parentKey, localName);
        // everything underneath in the fileDataMap is now unreachable
        return true;
    }
    get(key) {
        const sequence = _a.#getPathSequence(key);
        const stack = this.#getPathQueue(sequence, false);
        if (!stack)
            return undefined;
        const lastKey = stack.at(-1);
        return this.#fileDataMap.get(lastKey)?.value;
    }
    has(key) {
        const sequence = _a.#getPathSequence(key);
        const stack = this.#getPathQueue(sequence, false);
        if (!stack)
            return false;
        const lastKey = stack.at(-1);
        return this.#fileDataMap.has(lastKey);
    }
    set(key, value) {
        const sequence = _a.#getPathSequence(key);
        const stack = this.#getPathQueue(sequence, true);
        if (!stack) {
            throw new Error(`missing an ancestor of "${key}"`);
        }
        const lastKey = stack.at(-1);
        let localData = this.#fileDataMap.get(lastKey);
        if (localData) {
            localData.value = value;
        }
        else {
            localData = {
                value,
                localName: sequence.at(-1),
                parentKey: stack.at(-2),
            };
            this.#fileDataMap.set(lastKey, localData);
        }
        return this;
    }
    entries() {
        return this[Symbol.iterator]();
    }
    *keys() {
        for (const [key] of this[Symbol.iterator]()) {
            yield key;
        }
    }
    *values() {
        for (const [key, value] of this[Symbol.iterator]())
            yield value;
    }
    [Symbol.iterator]() {
        return this.#recursiveEntries(this, "");
    }
    *#recursiveEntries(parentKey, parentPath) {
        const entries = Array.from(this.#descendantsMap.entriesFor(parentKey));
        if (entries.length === 0)
            return;
        const isTopLevel = parentKey === this;
        entries.sort(isTopLevel ?
            _a.#topLevelEntryComparator :
            _a.#fileEntryComparator);
        for (const [localName, fileKey] of entries) {
            const fileData = this.#fileDataMap.get(fileKey);
            const fullPath = _a.#joinPaths(parentPath, localName);
            yield [fullPath, fileData.value];
            yield* this.#recursiveEntries(fileKey, fullPath);
        }
    }
    //#endregion standard Map API's
    rename(parentPath, oldLeafName, newLeafName) {
        if (!parentPath || !oldLeafName || !newLeafName)
            throw new Error("all arguments must be non-empty");
        if (oldLeafName.includes("/") || newLeafName.includes("/"))
            throw new Error("no slashes in renames"); // we'll deal with that if we need to
        if (oldLeafName.startsWith(".") || newLeafName.startsWith(".")) {
            throw new Error("leaf names cannot start with a dot");
        }
        const sequence = _a.#getPathSequence(parentPath);
        const stack = this.#getPathQueue(sequence, false);
        if (!stack)
            return false;
        const lastParentKey = stack.at(-1);
        if (this.#descendantsMap.has(lastParentKey, newLeafName))
            return false;
        const keyToMove = this.#descendantsMap.get(lastParentKey, oldLeafName);
        if (!keyToMove)
            return false;
        this.#descendantsMap.set(lastParentKey, newLeafName, keyToMove);
        this.#descendantsMap.delete(lastParentKey, oldLeafName);
        this.#fileDataMap.get(keyToMove).localName = newLeafName;
        return true;
    }
    //#region copying API's
    copyFrom(other, otherTreePath, localTreePath, leafName) {
        const thisSequence = _a.#getPathSequence(localTreePath);
        const stack = this.#getPathQueue(thisSequence, false)?.slice();
        if (!stack)
            return false;
        // avoid a collision
        if (this.#descendantsMap.has(stack.at(-1), leafName))
            return false;
        if (!other.has(_a.#joinPaths(otherTreePath, leafName)))
            return false;
        const traversal = {
            enterChild: () => stack.push(this.#createNewKey()),
            leaveChild: () => stack.pop(),
            notifyFileData: (localName, value) => {
                const parentKey = stack.at(-2), childKey = stack.at(-1);
                this.#descendantsMap.set(parentKey, localName, childKey);
                this.#fileDataMap.set(childKey, {
                    value,
                    localName,
                    parentKey,
                });
            }
        };
        other[COPY_TRAVERSE_MAP](otherTreePath, leafName, traversal);
        return true;
    }
    [COPY_TRAVERSE_MAP](localTreeKey, childName, traversal) {
        const thisSequence = _a.#getPathSequence(localTreeKey);
        const stack = this.#getPathQueue(thisSequence, false);
        if (!stack)
            return;
        this.#copyTraversalMap(stack.at(-1), [childName], traversal);
    }
    #copyTraversalMap(localTreeKey, childNames, traversal) {
        for (const leafName of childNames) {
            traversal.enterChild();
            const childKey = this.#descendantsMap.get(localTreeKey, leafName);
            const localData = this.#fileDataMap.get(childKey);
            traversal.notifyFileData(localData.localName, localData.value.clone());
            const grandchildKeys = this.#descendantsMap.strongKeysFor(childKey);
            if (grandchildKeys.size > 0) {
                this.#copyTraversalMap(childKey, Array.from(grandchildKeys), traversal);
            }
            traversal.leaveChild();
        }
    }
    //#endregion copying API's
    get [Symbol.toStringTag]() {
        return "FileSystemMap";
    }
}
_a = FileSystemMap;
