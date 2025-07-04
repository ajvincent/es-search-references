const encoder = new TextEncoder();
const decoder = new TextDecoder();
const FileSystemUtilities = {
    readContents: function (fileHandle) {
        const buffer = new Uint8Array();
        fileHandle.read(buffer, { at: 0 });
        return decoder.decode(buffer);
    },
    writeContents: function (fileHandle, contents) {
        fileHandle.truncate(0);
        const buffer = new Uint8Array(encoder.encode(contents));
        fileHandle.write(buffer, { at: 0 });
    },
    copyFileSync: function (sourceFileHandle, targetFileHandle) {
        const buffer = new Uint8Array();
        sourceFileHandle.read(buffer, { at: 0 });
        targetFileHandle.truncate(0);
        targetFileHandle.write(buffer);
    },
    directoryTraversal: async function (pathToCurrentDirectory, directory, callback) {
        for await (let [key, value] of directory.entries()) {
            key = key ? pathToCurrentDirectory + "/" + key : key;
            callback(key, value);
            if (value.kind === "directory") {
                await this.directoryTraversal(key, value, callback);
            }
        }
    },
    protocolTraversal: async function (urlsDirectory, callback) {
        for await (let [key, value] of urlsDirectory.entries()) {
            key += "://";
            callback(key, value);
            this.directoryTraversal(key, value, callback);
        }
    }
};
export { FileSystemUtilities, };
