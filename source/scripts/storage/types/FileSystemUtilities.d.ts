export interface FileSystemUtilities {
  readContents(
    fileHandle: FileSystemFileHandle
  ): Promise<string>;

  writeContents(
    fileHandle: FileSystemFileHandle,
    contents: string
  ): Promise<void>;

  copyRecursive(
    sourceDirectory: FileSystemDirectoryHandle,
    name: string,
    targetDirectory: FileSystemDirectoryHandle
  ): Promise<void>;
}
