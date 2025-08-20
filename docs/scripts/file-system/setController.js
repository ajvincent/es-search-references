import { FileSystemSetView, ValidFileOperations } from "./views/fs-set.js";
import { ReferenceSpecRecord } from "../reference-spec/WebFileSystem.js";
export { ValidFileOperations };
export class FileSystemSetController {
    static referenceFSLabel = "Reference-spec file system";
    static #decoder = new TextDecoder;
    #fsFrontEnd;
    view;
    constructor(fsFrontEnd) {
        this.#fsFrontEnd = fsFrontEnd;
        this.view = new FileSystemSetView(fsFrontEnd);
    }
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
    async ensureReferenceFS() {
        const currentFileSystems = await this.#fsFrontEnd.getAvailableSystems();
        const descriptions = Object.values(currentFileSystems);
        for (const desc of descriptions) {
            if (desc === FileSystemSetController.referenceFSLabel)
                return;
        }
        const uuid = await this.#fsFrontEnd.buildEmpty(FileSystemSetController.referenceFSLabel);
        const webFS = await this.#fsFrontEnd.getWebFS(uuid);
        await webFS.importDirectoryRecord(ReferenceSpecRecord);
    }
    async getFileEntries() {
        throw new Error("to be re-implemented");
    }
    async getExportedFilesZip() {
        throw new Error("to be re-implemented");
    }
    /*
    async getFileEntries(): Promise<[string, string][]> {
      const buffer: ArrayBuffer = await this.view.fileUploadPicker.files![0]!.arrayBuffer();
      const firstFile = new Uint8Array(buffer);
  
      const deferred = Promise.withResolvers<Record<string, Uint8Array>>();
      const filter: UnzipFileFilter = file => {
        return file.size > 0;
      }
      const resultFn: UnzipCallback = (err, unzipped) => {
        if (err)
          deferred.reject(err);
        else
          deferred.resolve(unzipped);
      };
      unzip(firstFile, { filter }, resultFn);
      const fileRecords: Record<string, Uint8Array> = await deferred.promise;
  
      const prefix = this.view.uploadRoot.value;
      return Object.entries(fileRecords).map(
        ([pathToFile, contentsArray]) => [prefix + pathToFile, FileSystemSetController.#decoder.decode(contentsArray)]
      );
    }
  
    async getExportedFilesZip(fsMap: FileSystemMap): Promise<File> {
      const exportedFiles: ExportedFileSystem = fsMap.exportAsJSON();
  
      const deferred = Promise.withResolvers<Uint8Array<ArrayBufferLike>>();
      const resultFn: FlateCallback = (err, zipped) => {
        if (err)
          deferred.reject(err);
        else
          deferred.resolve(zipped);
      }
  
      zip(exportedFiles, resultFn);
  
      const zipUint8: Uint8Array<ArrayBufferLike> = await deferred.promise;
      return new File([zipUint8], "exported-files.zip", { type: "application/zip" });
    }
    */
    reset() {
        this.view.updateExistingSystemSelector();
        this.form.reset();
    }
}
