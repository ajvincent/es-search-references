/**
 * When you have keys and promised values, this provides a resolve() method to resolve the values.
 *
 * @see {@link https://github.com/tc39/proposal-await-dictionary}
 */
export class AwaitedMap extends Map {
    async #settlePromises() {
        const promisedEntries = Array.from(this.entries());
        const names = promisedEntries.map(e => e[0]), promises = promisedEntries.map(e => e[1]);
        const values = await Promise.allSettled(promises);
        return values.map((value, index) => [names[index], value]);
    }
    async allSettled() {
        const entries = await this.#settlePromises();
        return new Map(entries);
    }
    async allResolved() {
        const entries = await this.#settlePromises();
        const rejectedEntries = entries.filter(entry => entry[1].status === "rejected");
        if (rejectedEntries.length)
            throw new AwaitedMapError(rejectedEntries);
        return new Map(entries.map(entry => [entry[0], entry[1].value]));
    }
}
export class AwaitedMapError extends Error {
    constructor(rejectedEntries) {
        super("AwaitedMap.resolve() failed");
        this.errorMap = new Map(rejectedEntries.map(entry => [entry[0], entry[1].reason]));
    }
    errorMap;
}
