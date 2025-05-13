export class WebGuestRealmInputs {
    startingSpecifier;
    #filesMap;
    constructor(startingSpecifier, filesMap) {
        this.startingSpecifier = startingSpecifier;
        this.#filesMap = filesMap;
    }
    contentsGetter(specifier) {
        const contents = this.#filesMap.get(specifier);
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
