import { unzip } from "../../../lib/packages/fflate.js";
export class FileUploadsView {
    displayElement;
    #fileUploadPicker;
    constructor() {
        this.displayElement = document.getElementById("file-system-controls-grid");
        this.#fileUploadPicker = this.displayElement.elements.namedItem("file-upload-picker");
    }
    async getFiles() {
        const firstFile = await this.#fileUploadPicker.files[0].bytes();
        const deferred = Promise.withResolvers();
        unzip(firstFile, (err, unzipped) => {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(unzipped);
        });
        const fileRecords = await deferred.promise;
        const decoder = new TextDecoder;
        const fileMap = new Map(Object.entries(fileRecords).map(([pathToFile, contentsArray]) => {
            return [pathToFile, decoder.decode(contentsArray)];
        }));
    }
}
