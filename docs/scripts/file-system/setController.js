import { FileSystemSetView, ValidFileOperations } from "./views/fs-set.js";
import { unzip } from "../../lib/packages/fflate.js";
export { ValidFileOperations };
export class FileSystemSetController {
    static #decoder = new TextDecoder;
    view = new FileSystemSetView();
    get form() {
        return this.view.displayElement;
    }
    get selectedOperation() {
        return this.view.selectedOperation;
    }
    getSourceFileSystem() {
        return this.view.sourceSelector.value;
    }
    getTargetFileSystem() {
        return this.view.targetInput.value;
    }
    async getFileEntries() {
        const buffer = await this.view.fileUploadPicker.files[0].arrayBuffer();
        const firstFile = new Uint8Array(buffer);
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
        const prefix = this.view.uploadRoot.value;
        return Object.entries(fileRecords).map(([pathToFile, contentsArray]) => [prefix + pathToFile, FileSystemSetController.#decoder.decode(contentsArray)]);
    }
}
