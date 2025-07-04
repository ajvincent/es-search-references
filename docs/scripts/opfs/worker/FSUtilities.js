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
};
export { FileSystemUtilities, };
