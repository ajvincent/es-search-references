import type {
  Promisable
} from "type-fest";

const FileSystemUtilities = {
  readFile: async function(
    fileHandle: FileSystemFileHandle
  ): Promise<string>
  {
    const file = await fileHandle.getFile();
    return file.text();
  },

  writeFile: async function(
    fileHandle: FileSystemFileHandle,
    contents: string
  ): Promise<void>
  {
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  },

  directoryTraversal: async function(
    pathToCurrentDirectory: string,
    excludeDelimiter: boolean,
    directory: FileSystemDirectoryHandle,
    callback: (
      pathToEntry: string,
      entry: FileSystemDirectoryHandle | FileSystemFileHandle,
    ) => Promisable<void>
  ): Promise<void>
  {
    for await (let [key, value] of directory.entries()) {
      if (excludeDelimiter)
        key = pathToCurrentDirectory + key;
      else
        key = pathToCurrentDirectory + "/" + key;

      await callback(
        key,
        value as FileSystemDirectoryHandle | FileSystemFileHandle
      );

      if (value.kind === "directory") {
        await this.directoryTraversal(key, false, value as FileSystemDirectoryHandle, callback);
      }
    }
  },
}

export {
  FileSystemUtilities,
};
