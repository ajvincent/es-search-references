export class URLDirHandle implements FileSystemDirectoryHandle {
  constructor(
    rawDirectory: FileSystemDirectoryHandle
  )
  {
    this.rawDirectory = rawDirectory;
  }

  readonly rawDirectory: FileSystemDirectoryHandle;
  readonly kind = "directory";

  getDirectoryHandle(
    name: string,
    options?: FileSystemGetDirectoryOptions
  ): Promise<FileSystemDirectoryHandle>
  {
    if (name.endsWith("://"))
      return this.rawDirectory.getDirectoryHandle(name.substring(0, name.length - 3), options);
    throw new Error(`name must end with "://"`);
  }

  getFileHandle(): Promise<FileSystemFileHandle>
  {
    throw new Error("You can't get a file handle from a URL directory.  These represent protocols.");
  }

  removeEntry(
    name: string,
    options?: FileSystemRemoveOptions
  ): Promise<void>
  {
    if (name.endsWith("://"))
      return this.rawDirectory.removeEntry(name.substring(0, name.length - 3), options);
    throw new Error(`name must end with "://"`);
  }

  async resolve(
    possibleDescendant: FileSystemHandle
  ): Promise<string[] | null>
  {
    const rawResolve = await this.rawDirectory.resolve(possibleDescendant);
    if (rawResolve?.length) {
      rawResolve[0] += "://";
    }
    return rawResolve;
  }

  entries(): FileSystemDirectoryHandleAsyncIterator<[string, FileSystemHandle]> {
    return this[Symbol.asyncIterator]();
  }

  async * keys(): FileSystemDirectoryHandleAsyncIterator<string> {
    for await (const key of this.rawDirectory.keys()) {
      yield key + "://";
    }
  }

  values(): FileSystemDirectoryHandleAsyncIterator<FileSystemHandle> {
    return this.rawDirectory.values();
  }

  async * [Symbol.asyncIterator](): FileSystemDirectoryHandleAsyncIterator<[string, FileSystemHandle]> {
    for await (const [key, handle] of this.rawDirectory.entries()) {
      yield [key + "://", handle];
    }
  }

  get name(): string {
    return this.rawDirectory.name;
  }

  isSameEntry(other: unknown): Promise<boolean> {
    if (other instanceof URLDirHandle) {
      return Promise.resolve(other === this);
    }
    return Promise.resolve(false);
  }
}
