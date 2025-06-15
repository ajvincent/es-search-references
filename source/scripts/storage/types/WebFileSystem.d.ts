import {
  WebFSFileType
} from "../constants.js";

export interface WebFSNodeBaseIfc<FileType extends WebFSFileType> {
  readonly fileType: FileType;
}

export type WebFSParentNodeAlias = WebFSPackageIfc | WebFSURLIfc | WebFSDirectoryIfc;

export interface WebFSChildNodeIfc<FileType extends WebFSFileType> extends WebFSNodeBaseIfc<FileType> {
  /** Setting this marks the file as dirty if the parentFile was previously defined. */
  parentFileEntry: WebFSParentNodeAlias | undefined;
}

export interface WebFSParentNodeIfc {
  readonly children: ReadonlyMap<string, WebFSDirectoryIfc | WebFSFileIfc>;
}

export interface WebFSPackageIfc extends WebFSNodeBaseIfc<WebFSFileType.PACKAGE>, WebFSParentNodeIfc {
}

export interface WebFSURLIfc extends WebFSNodeBaseIfc<WebFSFileType.URL>, WebFSParentNodeIfc {
}

export interface WebFSDirectoryIfc extends WebFSChildNodeIfc<WebFSFileType.DIR>, WebFSParentNodeIfc {
  localName: string;
  get fullPath(): string;
}

export interface WebFSFileIfc extends WebFSChildNodeIfc<WebFSFileType.FILE> {
  localName: string;
  get fullPath(): string;
  contents: string;
  set root(newRoot: WebFSRootIfc);
}

export interface WebFSRootIfc {
  readonly isReadonly: boolean;
  readonly packages: WebFSPackageIfc;
  readonly urls: WebFSURLIfc;

  markDirty(fileStructureChanged: boolean, fileNode: WebFSDirectoryIfc | WebFSNodeIfc): void;
}

export type WebFSNodeIfc = WebFSPackageIfc | WebFSURLIfc | WebFSDirectoryIfc | WebFSFileIfc;
