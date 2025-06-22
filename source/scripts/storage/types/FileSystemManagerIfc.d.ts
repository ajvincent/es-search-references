import type {
  WebFileSystemIfc
} from "./WebFileSystemIfc.js";

export interface FileSystemManagerIfc {
  get availableSystems(): ReadonlyMap<string, string>;

  buildEmpty(
    description: string,
  ): Promise<WebFileSystemIfc>;

  getExisting(
    key: string
  ): Promise<WebFileSystemIfc>;

  importFromZip(
    description: string,
    zipFile: File
  ): Promise<WebFileSystemIfc>;
}

export interface FSManagerInternalIfc {
  setDescription(
    key: string,
    newDescription: string
  ): Promise<void>;

  remove(key: string): Promise<void>;
}
