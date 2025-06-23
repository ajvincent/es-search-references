import type {
  FileSystemClipboardIfc
} from "./FileSystemClipboardIfc.js";

export interface WebFileSystemIfc {
  get description(): string;
  setDescription(newDesc: string): Promise<void>;

  readonly clipboard: FileSystemClipboardIfc;

  getPackageEntries(): FileSystemDirectoryHandleAsyncIterator<[
    string, FileSystemDirectoryHandle | FileSystemFileHandle
  ]>;

  getPackageFileHandle(
    name: string,
    options?: FileSystemGetFileOptions
  ): Promise<FileSystemFileHandle>;

  getPackageDirectoryHandle(
    name: string,
    options?: FileSystemGetDirectoryOptions
  ): Promise<FileSystemDirectoryHandle>;

  removePackageEntry(
    name: string,
    options?: FileSystemRemoveOptions
  ): Promise<void>;

  getURLEntries(): FileSystemDirectoryHandleAsyncIterator<[
    `${string}://`, FileSystemDirectoryHandle | FileSystemFileHandle
  ]>;

  getURLDirectoryHandle(
    name: `${string}://`, 
    options?: FileSystemGetDirectoryOptions
  ): Promise<FileSystemDirectoryHandle>;

  removeURLDirectory(
    name: `${string}://`,
    options?: FileSystemRemoveOptions
  ): Promise<void>;

  getDirectoryByResolvedPath(
    name: string
  ): Promise<FileSystemDirectoryHandle>;

  getFileByResolvedPath(
    name: string
  ): Promise<FileSystemFileHandle>;

  getWebFilesMap(): Promise<ReadonlyMap<string, string>>;

  importFilesMap(
    map: ReadonlyMap<`packages/${string}` | `urls/${string}`, string>
  ): Promise<void>;

  exportAsZip(): Promise<File>;

  remove(): Promise<void>;
}
