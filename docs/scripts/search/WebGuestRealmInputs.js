export class WebGuestRealmInputs {
    startingSpecifier;
    #filesMap;
    constructor(startingSpecifier, filesMap) {
        this.startingSpecifier = startingSpecifier;
        this.#filesMap = filesMap;
    }
    contentsGetter(specifier) {
        if (specifier === "es-search-references/guest")
            return `export {};`;
        if (!specifier.startsWith("virtual://")) {
            throw new Error("specifier must start with virtual://");
        }
        const contents = this.#filesMap.get(specifier.substr(10));
        if (!contents) {
            throw new Error("no contents found for specifier: " + specifier);
        }
        return contents;
    }
    resolveSpecifier(targetSpecifier, sourceSpecifier) {
        if (targetSpecifier.startsWith("./") || targetSpecifier.startsWith("../")) {
            const newSpecifier = URL.parse(targetSpecifier, sourceSpecifier);
            if (!newSpecifier)
                throw new Error(`could not resolve specifier "${targetSpecifier}" from source "${sourceSpecifier}"`);
            return newSpecifier.href;
        }
        return targetSpecifier;
    }
}
