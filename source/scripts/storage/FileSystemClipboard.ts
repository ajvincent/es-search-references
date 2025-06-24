import type {
  FileSystemClipboardIfc
} from "./types/FileSystemClipboardIfc.js";

import {
  FileSystemUtilities
} from "./FileSystemUtilities.js";

export class FileSystemClipboard implements FileSystemClipboardIfc {
  static async build(
    topDir: FileSystemDirectoryHandle
  ): Promise<FileSystemClipboardIfc>
  {
    const clipboard = new FileSystemClipboard(topDir);
    await clipboard.flushOtherDirectories();
    return clipboard;
  }

  static readonly #indexFileName = ".index";
  readonly #topDir: FileSystemDirectoryHandle;

  constructor(
    topDir: FileSystemDirectoryHandle
  )
  {
    this.#topDir = topDir;
  }

  async #getIndexName(): Promise<string | null> {
    try {
      const name = await FileSystemUtilities.readContents(
        this.#topDir,
        FileSystemClipboard.#indexFileName
      );
      return name === "" ? null : name;
    }
    catch (ex) {
      return Promise.resolve(null);
    }
  }

  private async flushOtherDirectories(): Promise<void> {
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
    const targetName = window.crypto.randomUUID();

    const targetDirectory = await this.#topDir.getDirectoryHandle(targetName, { create: true });
    await FileSystemUtilities.copyDirectoryRecursive(sourceDirectory, name, targetDirectory);

    const oldClipboardName: string | null = await this.#getIndexName();
    await FileSystemUtilities.writeContents(
      this.#topDir, FileSystemClipboard.#indexFileName, targetName
    );

    if (oldClipboardName)
      this.#topDir.removeEntry(oldClipboardName, { recursive: true });
  }

  async copyTo(targetDirectory: FileSystemDirectoryHandle): Promise<void> {
    const clipboardName: string | null = await this.#getIndexName();
    if (clipboardName) {
      await FileSystemUtilities.copyDirectoryRecursive(
        this.#topDir, clipboardName, targetDirectory
      );
    }
  }

  async clear(): Promise<void> {
    const clipboardName: string | null = await this.#getIndexName();
    if (clipboardName) {
      await FileSystemUtilities.writeContents(this.#topDir, FileSystemClipboard.#indexFileName, "");
      this.#topDir.removeEntry(clipboardName, { recursive: true });
    }
  }
}
