export class URLDirHandle {
    constructor(rawDirectory) {
        this.rawDirectory = rawDirectory;
    }
    rawDirectory;
    kind = "directory";
    getDirectoryHandle(name, options) {
        if (name.endsWith("://"))
            return this.rawDirectory.getDirectoryHandle(name.substring(0, name.length - 3), options);
        throw new Error(`name must end with "://"`);
    }
    getFileHandle() {
        throw new Error("You can't get a file handle from a URL directory.  These represent protocols.");
    }
    removeEntry(name, options) {
        if (name.endsWith("://"))
            return this.rawDirectory.removeEntry(name.substring(0, name.length - 3), options);
        throw new Error(`name must end with "://"`);
    }
    async resolve(possibleDescendant) {
        const rawResolve = await this.rawDirectory.resolve(possibleDescendant);
        if (rawResolve?.length) {
            rawResolve[0] += "://";
        }
        return rawResolve;
    }
    entries() {
        return this[Symbol.asyncIterator]();
    }
    async *keys() {
        for await (const key of this.rawDirectory.keys()) {
            yield key + "://";
        }
    }
    values() {
        return this.rawDirectory.values();
    }
    async *[Symbol.asyncIterator]() {
        for await (const [key, handle] of this.rawDirectory.entries()) {
            yield [key + "://", handle];
        }
    }
    get name() {
        return this.rawDirectory.name;
    }
    isSameEntry(other) {
        if (other instanceof URLDirHandle) {
            return Promise.resolve(other === this);
        }
        return Promise.resolve(false);
    }
}
