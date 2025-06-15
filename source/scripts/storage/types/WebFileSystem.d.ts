import {
  OrderedStringMap
} from "../../utilities/OrderedStringMap.js";

import {
  WebFSFileType
} from "../constants.js";

export interface WebFSNodeBaseIfc<FileType extends WebFSFileType> {
  localName: string;
  get fullPath(): string;
  readonly fileType: FileType;
}

export type WebFSParentNodeAlias = WebFSPackageIfc | WebFSURLIfc | WebFSDirectoryIfc;

export interface WebFSChildNodeIfc<FileType extends WebFSFileType> extends WebFSNodeBaseIfc<FileType> {
  /** Setting this does NOT mark the file as dirty! */
  parentFile: WebFSParentNodeAlias | undefined;
}

export interface WebFSParentNodeIfc {
  readonly children: OrderedStringMap<WebFSDirectoryIfc | WebFSFileIfc>;
}

export interface WebFSPackageIfc extends WebFSNodeBaseIfc<WebFSFileType.PACKAGE>, WebFSParentNodeIfc {
}

export interface WebFSURLIfc extends WebFSNodeBaseIfc<WebFSFileType.URL>, WebFSParentNodeIfc {
}

export interface WebFSDirectoryIfc extends WebFSChildNodeIfc<WebFSFileType.DIR>, WebFSParentNodeIfc {
}

export interface WebFSFileIfc extends WebFSChildNodeIfc<WebFSFileType.FILE> {
  contents: string;
  set root(newRoot: WebFSRootIfc);
}

export interface WebFSRootIfc {
  readonly isReadonly: boolean;
  readonly packages: OrderedStringMap<WebFSPackageIfc>;
  readonly urls: OrderedStringMap<WebFSURLIfc>;

  markDirty(fileStructureChanged: boolean, fileNode: WebFSNodeIfc): void;
}

export type WebFSNodeIfc = WebFSPackageIfc | WebFSURLIfc | WebFSDirectoryIfc | WebFSFileIfc;