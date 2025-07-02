const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SyncFileUtilities = {
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
    }
};
export { SyncFileUtilities };
