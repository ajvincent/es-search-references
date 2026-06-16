import type {
  GuestRealmInputs,
  SearchConfiguration
} from "../../lib/packages/runSearchesInGuestEngine.js";

export class WebGuestRealmInputs implements GuestRealmInputs {
  static readonly #packageURLPrefix = "package://package/";

  static #parseURL(sourceSpecifier: string, baseURL: URL | undefined): [URL, boolean] {
    const url = URL.parse(sourceSpecifier, baseURL);
    if (url)
      return [url, false];

    return [URL.parse(WebGuestRealmInputs.#packageURLPrefix + sourceSpecifier)!, true];
  }

  readonly startingSpecifier: string;
  readonly #filesMap: ReadonlyMap<string, string>;
  readonly #config: Required<SearchConfiguration>;

  constructor(
    startingSpecifier: string,
    filesMap: ReadonlyMap<string, string>,
    config: Required<SearchConfiguration>
  )
  {
    this.startingSpecifier = startingSpecifier;
    this.#filesMap = filesMap;
    this.#config = config;
  }

  contentsGetter(specifier: string): string {
    const contents = this.#filesMap.get(specifier);
    if (!contents) {
      throw new Error("no contents found for specifier: " + specifier);
    }
    return contents;
  }

  resolveSpecifier(targetSpecifier: string, sourceSpecifier: string): string {
    console.log(`WebGuestRealmInputs::resolveSpecifier(${JSON.stringify(targetSpecifier)}, ${JSON.stringify(sourceSpecifier)})`);
    if (targetSpecifier.startsWith("./") || targetSpecifier.startsWith("../")) {
      const [sourceURL, sourceIsPackage] = WebGuestRealmInputs.#parseURL(sourceSpecifier, undefined);
      const [targetURL, targetIsPackage] = WebGuestRealmInputs.#parseURL(targetSpecifier, sourceURL);
      if (!targetURL) {
        try {
          throw new Error(`could not resolve specifier "${targetSpecifier}" from source "${sourceSpecifier}"`)
        } catch (ex) {
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

  printToScriptLog(...values: readonly string[]): void {
    this.#config.printToScriptLog(...values);
  }
}
