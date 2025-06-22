export interface WebFileSystemIfc {
  readonly packagesDir: FileSystemDirectoryHandle;
  readonly urlsDir: Omit<FileSystemDirectoryHandle, "getFileHandle">;
  get description(): string;
  setDescription(newDesc: string): Promise<void>;

  getWebFilesMap(): Promise<ReadonlyMap<string, string>>;
  importFilesMap(
    map: ReadonlyMap<`packages/${string}` | `urls/${string}`, string>
  ): Promise<void>;
  exportAsZip(): Promise<File>;

  async remove(): Promise<void>;
}
