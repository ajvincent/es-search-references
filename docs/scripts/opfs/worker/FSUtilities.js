const FileSystemUtilities = {
    readFile: async function (fileHandle) {
        const file = await fileHandle.getFile();
        return file.text();
    },
    writeFile: async function (fileHandle, contents) {
        const writable = await fileHandle.createWritable();
        await writable.write(contents);
        await writable.close();
    },
    directoryTraversal: async function (pathToCurrentDirectory, excludeDelimiter, directory, callback) {
        for await (let [key, value] of directory.entries()) {
            if (excludeDelimiter)
                key = pathToCurrentDirectory + key;
            else
                key = pathToCurrentDirectory + "/" + key;
            await callback(key, value);
            if (value.kind === "directory") {
                await this.directoryTraversal(key, false, value, callback);
            }
        }
    },
    copyFile: async function (sourceDirectory, name, targetDirectory) {
        const [sourceFile, targetWriter] = await Promise.all([
            sourceDirectory.getFileHandle(name).then(handle => handle.getFile()),
            targetDirectory.getFileHandle(name, { create: true }).then(handle => handle.createWritable())
        ]);
        await targetWriter.write(sourceFile);
        await targetWriter.close();
    },
    copyDirectoryRecursive: async function (sourceDirectory, name, targetDirectory) {
        [sourceDirectory, targetDirectory] = await Promise.all([
            sourceDirectory.getDirectoryHandle(name),
            targetDirectory.getDirectoryHandle(name, { create: true })
        ]);
        const entries = await Array.fromAsync(sourceDirectory);
        const promises = new Set;
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
};
export { FileSystemUtilities, };
