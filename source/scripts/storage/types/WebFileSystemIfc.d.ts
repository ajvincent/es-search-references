export interface WebFileSystemIfc {
  readonly packagesDir: FileSystemDirectoryHandle;
  readonly urlsDir: Omit<FileSystemDirectoryHandle, "getFileHandle">;
  get description(): string;
  setDescription(newDesc: string): Promise<void>;

  getWebFilesMap(): Promise<ReadonlyMap<string, string>>;

  async remove(): Promise<void>;
}
