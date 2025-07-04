const encoder = new TextEncoder()
const decoder = new TextDecoder();

const FileSystemUtilities = {
  readContents: function (
    fileHandle: FileSystemSyncAccessHandle
  ): string
  {
    const buffer = new Uint8Array();
    fileHandle.read(buffer, { at: 0 });
    return decoder.decode(buffer);
  },

  writeContents: function(
    fileHandle: FileSystemSyncAccessHandle,
    contents: string
  ): void
  {
    fileHandle.truncate(0);
    const buffer = new Uint8Array(encoder.encode(contents));
    fileHandle.write(buffer, { at: 0 });
  },

  copyFileSync: function(
    sourceFileHandle: FileSystemSyncAccessHandle,
    targetFileHandle: FileSystemSyncAccessHandle
  ): void
  {
    const buffer = new Uint8Array();
    sourceFileHandle.read(buffer, { at: 0 });
    targetFileHandle.truncate(0);
    targetFileHandle.write(buffer);
  },

  directoryTraversal: async function(
    pathToCurrentDirectory: string,
    directory: FileSystemDirectoryHandle,
    callback: (
      pathToEntry: string,
      entry: FileSystemDirectoryHandle | FileSystemFileHandle,
    ) => void
  ): Promise<void>
  {
    for await (let [key, value] of directory.entries()) {
      key = key ? pathToCurrentDirectory + "/" + key : key;
      callback(
        key,
        value as FileSystemDirectoryHandle | FileSystemFileHandle
      );
      if (value.kind === "directory") {
        await this.directoryTraversal(key, value as FileSystemDirectoryHandle, callback);
      }
    }
  },

  protocolTraversal: async function(
    urlsDirectory: FileSystemDirectoryHandle,
    callback: (
      pathToEntry: string,
      entry: FileSystemDirectoryHandle | FileSystemFileHandle,
    ) => void
  ): Promise<void>
  {
    for await (let [key, value] of urlsDirectory.entries()) {
      key += "://";
      callback(key, value as FileSystemDirectoryHandle);
      this.directoryTraversal(key, value as FileSystemDirectoryHandle, callback);
    }
  }
}

export {
  FileSystemUtilities,
};
