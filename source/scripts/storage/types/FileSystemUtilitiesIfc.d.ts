export interface FileSystemUtilitiesIfc {
  readContents(
    dirHandle: FileSystemDirectoryHandle,
    fileName: string,
  ): Promise<string>;

  writeContents(
    dirHandle: FileSystemDirectoryHandle,
    fileName: string,
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
