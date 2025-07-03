export type DirectoryRecord<KeyType extends string = string> = {
  [key: KeyType ]: DirectoryRecord | string
};

export type TopDirectoryRecord = DirectoryRecord<
  `packages/${string}` | `urls/${string}`
>;

export interface OPFSWebFileSystemIfc {
  getWebFilesRecord(): Promise<{ [key: string]: string }>;

  importDirectoryRecord(
    dirRecord: TopDirectoryRecord
  ): Promise<void>;
  exportDirectoryRecord(): Promise<TopDirectoryRecord>;

  getPackageIndex(): Promise<DirectoryRecord>;
  createPackageDirDeep(pathToDir: string): Promise<void>;
  readPackageFileDeep(pathToFile: string): Promise<string>;
  writePackageFileDeep(pathToFile: string, contents: string): Promise<void>;
  removePackageEntry(pathToEntry: string): Promise<void>;

  getURLsIndex(): Promise<DirectoryRecord>;
  createURLDirDeep(pathToDir: string): Promise<void>;
  readURLFileDeep(pathToFile: string): Promise<string>;
  writeURLFileDeep(pathToFile: string, contents: string): Promise<void>;
  removeURLEntry(pathToEntry: string): Promise<void>;

  terminate(): Promise<void>;
}
