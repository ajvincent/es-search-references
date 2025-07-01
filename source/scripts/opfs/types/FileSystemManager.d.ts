import type {
  RequestMessageUnion,
  FulfillMessageUnion,
  RejectMessageUnion,
  WorkerUnionExtract,
} from "./messages.js";

export interface OPFSFileSystemManagerIfc {
  echo(token: string): Promise<{token: string, pathToRoot: string}>;
  getFileSystems(): Promise<{[key: string]: string}>;
}

export type OPFSRequestMessageUnion = RequestMessageUnion<OPFSFileSystemManagerIfc>;
export type OPFSFulfillMessageUnion = FulfillMessageUnion<OPFSFileSystemManagerIfc>;
export type OPFSRejectMessageUnion = RejectMessageUnion<OPFSFileSystemManagerIfc>;
