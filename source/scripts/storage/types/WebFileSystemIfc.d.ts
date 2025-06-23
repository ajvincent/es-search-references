import type {
  FileSystemClipboardIfc
} from "./FileSystemClipboardIfc.js";

export interface WebFileSystemIfc {
  readonly packagesDir: FileSystemDirectoryHandle;
  readonly urlsDir: FileSystemDirectoryHandle;
  get description(): string;
  setDescription(newDesc: string): Promise<void>;

  getWebFilesMap(): Promise<ReadonlyMap<string, string>>;
  importFilesMap(
    map: ReadonlyMap<`packages/${string}` | `urls/${string}`, string>
  ): Promise<void>;
  exportAsZip(): Promise<File>;

  async remove(): Promise<void>;

  readonly clipboard: FileSystemClipboardIfc;
}
