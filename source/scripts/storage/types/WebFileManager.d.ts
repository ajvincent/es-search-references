export interface WebFileManagerIfc {
  readonly packagesDir: FileSystemDirectoryHandle;
  readonly urlsDir: FileSystemDirectoryHandle;
  get description(): string;
  setDescription(newDesc: string): Promise<void>;

  getWebFilesMap(): Promise<ReadonlyMap<string, string>>;

  remove(): Promise<void>;
}
