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
    for await (const entry of directory.entries()) {
      let key: string = entry[0];
      const value: FileSystemHandle = entry[1];

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

  copyFile: async function (
    sourceDirectory: FileSystemDirectoryHandle,
    sourceLeafName: string,
    targetDirectory: FileSystemDirectoryHandle,
    targetLeafName: string = sourceLeafName
  ): Promise<void>
  {
    const [sourceFile, targetWriter] = await Promise.all([
      sourceDirectory.getFileHandle(sourceLeafName).then(handle => handle.getFile()),
      targetDirectory.getFileHandle(targetLeafName, { create: true }).then(handle => handle.createWritable())
    ]);

    await targetWriter.write(sourceFile);
    await targetWriter.close();
  },

  copyDirectoryRecursive: async function (
    sourceDirectory: FileSystemDirectoryHandle,
    sourceName: string,
    targetDirectory: FileSystemDirectoryHandle,
    targetName: string = sourceName
  ): Promise<void>
  {
    [sourceDirectory, targetDirectory] = await Promise.all([
      sourceDirectory.getDirectoryHandle(sourceName),
      targetDirectory.getDirectoryHandle(targetName, { create: true })
    ]);

    const entries = await Array.fromAsync(sourceDirectory);
    const promises = new Set<Promise<void>>;
    for (const [childName, handle] of entries) {
      if (handle.kind === "directory") {
        promises.add(this.copyDirectoryRecursive(sourceDirectory, childName, targetDirectory));
      }
      else {
        promises.add(this.copyFile(sourceDirectory, childName, targetDirectory));
      }
    }

    await Promise.all(promises);
  }
}

export {
  FileSystemUtilities,
};
