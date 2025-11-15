import {
  AwaitedMap
} from "../utilities/AwaitedMap.js";

import type {
  DirectoryRecord,
  OPFSWebFileSystemIfc
} from "../opfs/types/WebFileSystemIfc.js";

import type {
  FSContextMenuShowArgumentsIfc
} from "./types/FSContextMenuShowArgumentsIfc.js";

type AwaitedSetKeys = (
  "currentChildren" |
  "currentSiblings" |
  "currentPackages" |
  "currentURLs" |
  "clipboardP"
);

interface ClipboardContents {
  readonly type: "directory" | "file",
  readonly key: string;
}

export class FSContextMenuShowArguments {
  readonly #event: MouseEvent;
  readonly #pathToFile: string;
  readonly #isDirectory: boolean;
  readonly #webFS: OPFSWebFileSystemIfc;

  readonly promise: Promise<FSContextMenuShowArgumentsIfc>;

  constructor(
    event: MouseEvent,
    pathToFile: string,
    isDirectory: boolean,
    webFS: OPFSWebFileSystemIfc
  )
  {
    this.#event = event;
    this.#pathToFile = pathToFile;
    this.#isDirectory = isDirectory;
    this.#webFS = webFS;
    this.promise = this.#buildPromise();
  }

  async #buildPromise(): Promise<FSContextMenuShowArgumentsIfc>
  {
    const promiseMap: AwaitedMap<AwaitedSetKeys, ReadonlySet<string>> = new AwaitedMap();
    promiseMap.set("currentChildren", this.#currentChildrenPromise());
    promiseMap.set("currentSiblings", this.#currentSiblingsPromise());
    promiseMap.set("currentPackages", this.#currentPackagesPromise());
    promiseMap.set("currentURLs", this.#currentProtocolsPromise());

    const clipboardPromise: Promise<ClipboardContents | null> = this.#clipboardPromise();
    const mapPromise: Promise<Map<AwaitedSetKeys, ReadonlySet<string>>> = promiseMap.allResolved();

    const [map, clipboardContents] = await Promise.all([mapPromise, clipboardPromise]);

    let leafName: string;
    let pathIsProtocol: boolean;
    if (this.#pathToFile.endsWith("://")) {
      pathIsProtocol = true;
      leafName = this.#pathToFile;
    } else {
      pathIsProtocol = false;
      leafName = this.#pathToFile.replace(/^.*\//g, "");
    }

    const isReservedName: boolean = (
      this.#pathToFile == "es-search-references" ||
      this.#pathToFile == "es-search-references/guest"
    );
    return {
      event: this.#event,
      pathToFile: this.#pathToFile,
      pathIsProtocol,
      leafName,
      isReservedName,
      isDirectory: this.#isDirectory,
      currentChildren: map.get("currentChildren")!,
      currentSiblings: map.get("currentSiblings")!,
      currentPackages: map.get("currentPackages")!,
      currentProtocols: map.get("currentURLs")!,
      clipboardContentFileName: clipboardContents?.key ?? "",
      clipboardContentIsDir: clipboardContents?.type === "directory",
    };
  }

  async #currentChildrenPromise(): Promise<ReadonlySet<string>> {
    let keys: string[] = [];
    if (this.#isDirectory) {
      keys = await this.#webFS.listDirectoryMembers(this.#pathToFile);
    }
    return new Set(keys);
  }

  async #currentSiblingsPromise(): Promise<ReadonlySet<string>> {
    let keys: string[] = [];
    if (this.#pathToFile.endsWith("://")) {
      keys = await this.#webFS.listProtocols();
    } else {
      keys = await this.#webFS.listSiblingMembers(this.#pathToFile);
    }

    return new Set(keys);
  }

  async #currentPackagesPromise(): Promise<ReadonlySet<string>> {
    const keys: string[] = await this.#webFS.listDirectoryMembers("");
    return new Set(keys);
  }

  async #currentProtocolsPromise(): Promise<ReadonlySet<string>> {
    const keys: string[] = await this.#webFS.listProtocols();
    return new Set(keys);
  }

  async #clipboardPromise(): Promise<ClipboardContents | null> {
    const index: DirectoryRecord = await this.#webFS.getClipboardIndex();
    const entries = Object.entries(index);
    if (entries.length === 0) {
      return null;
    }
    if (entries.length > 1) {
      throw new Error("assertion failure, clipboard should have at most one entry");
    }
    const [key, content] = entries[0];
    const type: "directory" | "file" = (typeof content === "string") ? "file" : "directory";
    return {type, key};
  }
}
