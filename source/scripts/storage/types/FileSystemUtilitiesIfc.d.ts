export interface FileSystemUtilitiesIfc {
  readContents(
    fileHandle: FileSystemFileHandle
  ): Promise<string>;

  writeContents(
    fileHandle: FileSystemFileHandle,
    contents: string
  ): Promise<void>;

  copyFile(
    sourceDirectory: FileSystemDirectoryHandle,
    name: string,
    targetDirectory: FileSystemDirectoryHandle
  ): Promise<void>;

  copyDirectoryRecursive(
    sourceDirectory: FileSystemDirectoryHandle,
    name: string,
    targetDirectory: FileSystemDirectoryHandle
  ): Promise<void>;
}
