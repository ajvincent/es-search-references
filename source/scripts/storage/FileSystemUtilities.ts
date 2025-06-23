import type {
  FileSystemUtilitiesIfc
} from "./types/FileSystemUtilitiesIfc.js";

const FileSystemUtilities: FileSystemUtilitiesIfc = {
  readContents: async function (
    dirHandle: FileSystemDirectoryHandle,
    fileName: string,
  ): Promise<string>
  {
    const fileHandle = await dirHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return file.text();
  },

  writeContents: async function (
    dirHandle: FileSystemDirectoryHandle,
    fileName: string,
    contents: string
  ): Promise<void>
  {
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true});
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  },

  copyFile: async function (
    sourceDirectory: FileSystemDirectoryHandle,
    name: string,
    targetDirectory: FileSystemDirectoryHandle
  ): Promise<void>
  {
    const [sourceFile, targetWriter] = await Promise.all([
      sourceDirectory.getFileHandle(name).then(handle => handle.getFile()),
      targetDirectory.getFileHandle(name, { create: true }).then(handle => handle.createWritable())
    ]);

    await targetWriter.write(sourceFile);
    await targetWriter.close();
  },

  copyDirectoryRecursive: async function (
    sourceDirectory: FileSystemDirectoryHandle,
    name: string,
    targetDirectory: FileSystemDirectoryHandle
  ): Promise<void>
  {
    [sourceDirectory, targetDirectory] = await Promise.all([
      sourceDirectory.getDirectoryHandle(name),
      targetDirectory.getDirectoryHandle(name, { create: true })
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
  FileSystemUtilities
};
