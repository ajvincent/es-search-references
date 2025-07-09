import type {
  UUID
} from "./messages.js";

export interface OPFSFileSystemManagerIfc {
  getAvailableSystems(): Promise<{[key: string]: string}>;

  buildEmpty(
    description: string
  ): Promise<UUID>;

  setDescription(
    key: UUID,
    newDescription: string
  ): Promise<null>;

  remove(
    key: UUID
  ): Promise<null>;

  getWebFSPath(
    key: UUID
  ): Promise<string>;

  getClipboardPath(): Promise<string>;

  terminate(): Promise<void>;
}
