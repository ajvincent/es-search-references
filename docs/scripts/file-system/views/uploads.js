import { unzip } from "../../../lib/packages/fflate.js";
export class FileUploadsView {
    static #decoder = new TextDecoder;
    displayElement;
    #fileUploadPicker;
    #uploadRoot;
    #fileSystemSelector;
    constructor() {
        this.displayElement = document.getElementById("file-system-upload-form");
        const { elements } = this.displayElement;
        this.#fileUploadPicker = elements.namedItem("file-upload-picker");
        this.#uploadRoot = elements.namedItem("file-upload-root");
        this.#fileSystemSelector = elements.namedItem("file-system-upload-selector");
    }
    getSelectedFileSystem() {
        return this.#fileSystemSelector.value;
    }
    async getFileEntries() {
        const firstFile = await this.#fileUploadPicker.files[0].bytes();
        const deferred = Promise.withResolvers();
        const filter = file => {
            return file.size > 0;
        };
        const resultFn = (err, unzipped) => {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(unzipped);
        };
        unzip(firstFile, { filter }, resultFn);
        const fileRecords = await deferred.promise;
        const prefix = this.#uploadRoot.value;
        return Object.entries(fileRecords).map(([pathToFile, contentsArray]) => [prefix + pathToFile, FileUploadsView.#decoder.decode(contentsArray)]);
    }
}
