import {
  WebFSPackages
} from "./WebFSPackages.js";

import {
  WebFSURLs
} from "./WebFSURLs.js";

import type {
  WebFSRootIfc,
} from "./types/WebFileSystem.js";

export class WebFSRoot implements WebFSRootIfc {
  static fromJSON(): never {
    throw new Error("not yet implemented");
  }

  static fromZippable(): never {
    throw new Error("not yet implemented");
  }

  static buildEmpty(): never {
    throw new Error("not yet implemented");
  }

  readonly isReadonly: boolean;
  readonly #packages: WebFSPackages;
  readonly #urls: WebFSURLs;

  private constructor(
    isReadonly: boolean,
    packages: WebFSPackages,
    urls: WebFSURLs
  )
  {
    this.isReadonly = isReadonly;
    this.#packages = packages;
    this.#urls = urls;
  }

  getWebFilesMap(): ReadonlyMap<string, string> {
    throw new Error("Method not implemented.");
  }
}
