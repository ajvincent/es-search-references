import type {
  GuestRealmInputs
} from "../../lib/packages/runSearchesInGuestEngine.js";

export class WebGuestRealmInputs implements GuestRealmInputs {
  readonly startingSpecifier: string;
  readonly #filesMap: ReadonlyMap<string, string>;

  constructor(startingSpecifier: string, filesMap: ReadonlyMap<string, string>) {
    this.startingSpecifier = startingSpecifier;
    this.#filesMap = filesMap;
  }

  contentsGetter(specifier: string): string {
    if (specifier === "es-search-references/guest")
      return `export {};`;

    const contents = this.#filesMap.get(specifier);
    if (!contents) {
      throw new Error("no contents found for specifier: " + specifier);
    }
    return contents;
  }

  resolveSpecifier(targetSpecifier: string, sourceSpecifier: string): string {
    if (targetSpecifier.startsWith("./") || targetSpecifier.startsWith("../")) {
      const newSpecifier = URL.parse(targetSpecifier, sourceSpecifier);
      if (!newSpecifier)
        throw new Error(`could not resolve specifier "${targetSpecifier}" from source "${sourceSpecifier}"`)
      return newSpecifier.href;
    }

    return targetSpecifier;
  }
}
