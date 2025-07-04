export type DirectoryRecord = {
  [ key: string ]: DirectoryRecord | string
};

export type TopDirectoryRecord = {
  packages: DirectoryRecord;
  urls: { [key: string]: DirectoryRecord };
}

export type URLString = `${string}://${string}`;

export interface OPFSWebFileSystemIfc {
  getWebFilesRecord(): Promise<{ [key: string]: string }>;

  importDirectoryRecord(
    dirRecord: TopDirectoryRecord
  ): Promise<void>;
  exportDirectoryRecord(): Promise<TopDirectoryRecord>;

  getIndex(): Promise<TopDirectoryRecord>;
  createDirDeep(pathToDir: string): Promise<void>;
  readFileDeep(pathToFile: string): Promise<string>;
  writeFileDeep(pathToFile: string, contents: string): Promise<void>;
  removeEntry(pathToEntry: string): Promise<void>;

  terminate(): Promise<void>;
}
