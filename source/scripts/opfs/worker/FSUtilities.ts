const encoder = new TextEncoder()
const decoder = new TextDecoder();

const SyncFileUtilities = {
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
  }
}

export { SyncFileUtilities };
