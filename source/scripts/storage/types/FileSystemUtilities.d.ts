export interface FileSystemUtilities {
  bulkCopy(
    sourceDirectory: FileSystemDirectoryHandle,
    name: string,
    targetDirectory: FileSystemDirectoryHandle
  ): Promise<void>;
}
