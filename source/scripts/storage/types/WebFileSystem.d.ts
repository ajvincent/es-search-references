import {
  WebFSFileType
} from "../constants.js";

export type ZippableFileEntry = Uint8Array | ZippableDirectories;
export type ZippableDirectories = { [Key in string]: ZippableFileEntry };

export type JSONFileEntry = string | JSONDirectories;
export type JSONDirectories = { [Key in string]: string | JSONFileEntry };

export interface WebFSRootIfc {
  readonly isReadonly: boolean;

  getWebFilesMap(): ReadonlyMap<string, string>;
}

export interface WebFSNodeBaseIfc<FileType extends WebFSFileType> {
  readonly fileType: FileType;
}

export type WebFSParentNodeAlias = WebFSPackageIfc | WebFSURLIfc | WebFSDirectoryIfc;
export type WebFSFileEntryIfc = WebFSDirectoryIfc | WebFSFileIfc;

export interface WebFSChildNodeIfc<FileType extends WebFSFileType> extends WebFSNodeBaseIfc<FileType> {
}

export interface WebFSParentNodeIfc {
  readonly children: ReadonlyMap<string, WebFSFileEntryIfc>;

  addFileDeep(pathSequence: readonly string[], pathIndex: number, contents: string): void;
  addDirectoryDeep(pathSequence: readonly string[], pathIndex: number): void;

  removeFileDeep(pathSequence: readonly string[], pathIndex: number): WebFSFileIfc | WebFSDirectoryIfc;

  getFileDeep(pathSequence: readonly string[], pathIndex: number): WebFSFileIfc | WebFSDirectoryIfc;

  getWebFileEntriesDeep(thisName: string): Iterable<[string, WebFSFileIfc]>;

  /*
  toJSON(): Record<string, WebFSFileEntryIfc>;
  toZippable(): ZippableDirectories;
  */
}

export interface WebFSParentNodeStaticIfc<
  FileType extends WebFSFileType.PACKAGE | WebFSFileType.URL | WebFSFileType.DIR
>
{
  fromJSON(value: Record<string, WebFSFileEntryIfc>): Extract<WebFSParentNodeAlias, WebFSNodeBaseIfc<FileType>>;
  fromZippable(value: ZippableDirectories): Extract<WebFSParentNodeAlias, WebFSNodeBaseIfc<FileType>>;
}

export interface WebFSPackageIfc extends WebFSNodeBaseIfc<WebFSFileType.PACKAGE>, WebFSParentNodeIfc {
}

export interface WebFSURLIfc extends WebFSNodeBaseIfc<WebFSFileType.URL>, WebFSParentNodeIfc {
}

export interface WebFSDirectoryIfc extends WebFSChildNodeIfc<WebFSFileType.DIR>, WebFSParentNodeIfc {
}

export interface WebFSFileIfc extends WebFSChildNodeIfc<WebFSFileType.FILE> {
  contents: string;
  /*
  toJSON(): string;
  toZippable(): Uint8Array;
  */
}

export interface WebFSFileStaticIfc {
  fromJSON(contents: string): WebFSFileIfc;
  fromZippable(array: Uint8Array): WebFSFileIfc;
}

export type WebFSNodeIfc = WebFSPackageIfc | WebFSURLIfc | WebFSFileEntryIfc;
