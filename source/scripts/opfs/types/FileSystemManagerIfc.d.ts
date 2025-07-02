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

  terminate(): void;
}
