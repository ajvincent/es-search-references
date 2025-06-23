export interface FileSystemClipboardIfc {
  getCurrent(): Promise<FileSystemDirectoryHandle | null>;

  copyFrom(
    sourceDirectory: FileSystemDirectoryHandle,
    name: string
  ): Promise<void>;

  copyTo(
    sourceDirectory: FileSystemDirectoryHandle
  ): Promise<void>;

  clear(): Promise<void>;
}
