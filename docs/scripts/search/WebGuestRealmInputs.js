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
        console.log(`WebGuestRealmInputs::resolveSpecifier(${JSON.stringify(targetSpecifier)}, ${JSON.stringify(sourceSpecifier)})`);
        if (targetSpecifier.startsWith("./") || targetSpecifier.startsWith("../")) {
            const [sourceURL, sourceIsPackage] = WebGuestRealmInputs.#parseURL(sourceSpecifier, undefined);
            const [targetURL, targetIsPackage] = WebGuestRealmInputs.#parseURL(targetSpecifier, sourceURL);
            if (!targetURL) {
                try {
                    throw new Error(`could not resolve specifier "${targetSpecifier}" from source "${sourceSpecifier}"`);
                }
                catch (ex) {
                    console.error(ex);
                    throw ex;
                }
            }
            if (targetIsPackage || sourceIsPackage) {
                return targetURL.pathname.substring(1);
            }
            return targetURL.href;
        }
        return targetSpecifier;
    }
    static #packageURLPrefix = "package://package/";
    static #parseURL(sourceSpecifier, baseURL) {
        const url = URL.parse(sourceSpecifier, baseURL);
        if (url)
            return [url, false];
        return [URL.parse(WebGuestRealmInputs.#packageURLPrefix + sourceSpecifier), true];
    }
}
