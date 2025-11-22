import type {
  FileSystemClipboardIfc
} from "../types/FileSystemClipboardIfc.js";

import {
  FileSystemUtilities
} from "./FSUtilities.js";

const WorkerGlobal = self as unknown as DedicatedWorkerGlobalScope;

export class FileSystemClipboard implements FileSystemClipboardIfc {
  static readonly #indexFileName = ".index";

  static async build(
    topDir: FileSystemDirectoryHandle
  ): Promise<FileSystemClipboardIfc>
  {
    const clipboard = new FileSystemClipboard(topDir);
    await clipboard.flushOtherDirectories();
    return clipboard;
  }

  readonly #topDir: FileSystemDirectoryHandle;

  constructor(
    topDir: FileSystemDirectoryHandle
  )
  {
    this.#topDir = topDir;
  }

  async #getIndexFile(): Promise<FileSystemFileHandle> {
    return this.#topDir.getFileHandle(FileSystemClipboard.#indexFileName, { create: true });
  }

  async #getIndexName(): Promise<string | null> {
    try {
      const fileHandle = await this.#getIndexFile();
      const name = await FileSystemUtilities.readFile(fileHandle);
      return name === "" ? null : name;
    }
    catch {
      return Promise.resolve(null);
    }
  }

  async #writeIndexName(
    newIndexName: string
  ): Promise<void>
  {
    const fileHandle = await this.#getIndexFile();
    await FileSystemUtilities.writeFile(fileHandle, newIndexName);
  }

  public async flushOtherDirectories(): Promise<void> {
    const currentDirName: string | null = await this.#getIndexName();
    const keys = new Set<string>(await Array.fromAsync(this.#topDir.keys()));
    keys.delete(FileSystemClipboard.#indexFileName);

    if (currentDirName)
      keys.delete(currentDirName);

    if (keys.size === 0)
      return;

    // This should in theory never happen...
    const promises = new Set<Promise<void>>;
    for (const key of keys) {
      promises.add(this.#topDir.removeEntry(key, { recursive: true }));
    }
    await Promise.all(promises);
  }

  async getCurrent(): Promise<FileSystemDirectoryHandle | null> {
    const currentDirName: string | null = await this.#getIndexName();
    return currentDirName ? this.#topDir.getDirectoryHandle(currentDirName) : null;
  }

  async copyFrom(
    sourceDirectory: FileSystemDirectoryHandle,
    name: string
  ): Promise<void>
  {
    const oldClipboardName: string | null = await this.#getIndexName();
    const newClipboardName = WorkerGlobal.crypto.randomUUID();
    const clipboardDirectory = await this.#topDir.getDirectoryHandle(newClipboardName, { create: true });

    let child: FileSystemHandle | undefined;
    try {
      child = await sourceDirectory.getDirectoryHandle(name, { create: false });
    }
    catch {
      child = await sourceDirectory.getFileHandle(name, { create: false });
    }

    if (child.kind === "directory")
      await FileSystemUtilities.copyDirectoryRecursive(sourceDirectory, name, clipboardDirectory);
    else {
      await FileSystemUtilities.copyFile(sourceDirectory, name, clipboardDirectory);
    }

    await this.#writeIndexName(newClipboardName);

    if (oldClipboardName)
      await this.#topDir.removeEntry(oldClipboardName, { recursive: true });
  }

  async copyTo(targetDirectory: FileSystemDirectoryHandle): Promise<void> {
    const clipboardName: string | null = await this.#getIndexName();
    if (clipboardName) {
      const clipboardDirectory = await this.#topDir.getDirectoryHandle(clipboardName);

      // there will be at most one child of the clipboard directory
      for await (const child of clipboardDirectory.values()) {
        if (child.kind === "directory")
          await FileSystemUtilities.copyDirectoryRecursive(clipboardDirectory, child.name, targetDirectory);
        else
          await FileSystemUtilities.copyFile(clipboardDirectory, child.name, targetDirectory);
      }
    }
  }

  async clear(): Promise<void> {
    const clipboardName: string | null = await this.#getIndexName();
    if (clipboardName) {
      await this.#writeIndexName("");
      await this.#topDir.removeEntry(clipboardName, { recursive: true });
    }
  }
}
