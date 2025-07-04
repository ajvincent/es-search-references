export type DirectoryRecord = {
  [ key: string ]: DirectoryRecord | string
};

export type TopDirectoryRecord = {
  packages: DirectoryRecord;
  urls: { [key: string]: DirectoryRecord };
}

export interface OPFSWebFileSystemIfc {
  getWebFilesRecord(): Promise<{ [key: string]: string }>;

  importDirectoryRecord(
    dirRecord: TopDirectoryRecord
  ): Promise<void>;

  exportDirectoryRecord(): Promise<TopDirectoryRecord>;

  getIndex(): Promise<DirectoryRecord>;
  createDirDeep(pathToDir: string): Promise<void>;
  readFileDeep(pathToFile: string): Promise<string>;
  writeFileDeep(pathToFile: string, contents: string): Promise<void>;
  removeEntry(pathToEntry: string): Promise<void>;

  terminate(): Promise<void>;
}
