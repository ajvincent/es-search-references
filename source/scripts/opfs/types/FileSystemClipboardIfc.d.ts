export interface FileSystemClipboardIfc {
  getCurrent(): Promise<FileSystemDirectoryHandle | null>;

  copyFrom(
    sourceDirectory: FileSystemDirectoryHandle,
    name: string
  ): Promise<void>;

  copyTo(
    targetDirectory: FileSystemDirectoryHandle
  ): Promise<void>;

  clear(): Promise<void>;
}
