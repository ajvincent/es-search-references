import type {
  FileSystemClipboardIfc
} from "./types/FileSystemClipboardIfc.js";

export class FileSystemClipboard implements FileSystemClipboardIfc {
  readonly #topDir: FileSystemDirectoryHandle;

  constructor(topDir: FileSystemDirectoryHandle) {
    this.#topDir = topDir;
  }

  getCurrent(): Promise<FileSystemDirectoryHandle | null> {
    throw new Error("Method not implemented.");
  }
  copyFrom(sourceDirectory: FileSystemDirectoryHandle, name: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  copyTo(sourceDirectory: FileSystemDirectoryHandle): Promise<void> {
    throw new Error("Method not implemented.");
  }
  clear(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
