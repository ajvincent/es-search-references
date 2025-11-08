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
    copyFile: async function (sourceDirectory, sourceLeafName, targetDirectory, targetLeafName = sourceLeafName) {
        const [sourceFile, targetWriter] = await Promise.all([
            sourceDirectory.getFileHandle(sourceLeafName).then(handle => handle.getFile()),
            targetDirectory.getFileHandle(targetLeafName, { create: true }).then(handle => handle.createWritable())
        ]);
        await targetWriter.write(sourceFile);
        await targetWriter.close();
    },
    copyDirectoryRecursive: async function (sourceDirectory, sourceName, targetDirectory, targetName = sourceName) {
        [sourceDirectory, targetDirectory] = await Promise.all([
            sourceDirectory.getDirectoryHandle(sourceName),
            targetDirectory.getDirectoryHandle(targetName, { create: true })
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
