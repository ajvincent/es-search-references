import { FileSystemSetView, ValidFileOperations } from "./views/fs-set.js";
import { ReferenceSpecRecord } from "../reference-spec/WebFileSystem.js";
export { ValidFileOperations };
export class FileSystemSetController {
    static referenceFSLabel = "Reference-spec file system";
    static #decoder = new TextDecoder;
    #fsFrontEnd;
    view;
    #workbenchFileSystemSelector;
    constructor(fsFrontEnd, workbenchFileSystemSelector) {
        this.#fsFrontEnd = fsFrontEnd;
        this.view = new FileSystemSetView(fsFrontEnd);
        this.#workbenchFileSystemSelector = workbenchFileSystemSelector;
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
    getTargetFileDescriptor() {
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
    async getReferenceUUID() {
        const currentFileSystems = await this.#fsFrontEnd.getAvailableSystems();
        for (const [uuid, desc] of Object.entries(currentFileSystems)) {
            if (desc === FileSystemSetController.referenceFSLabel)
                return uuid;
        }
        throw new Error('we should have a reference UUID by now!');
    }
    async doFileSystemClone() {
        const sourceUUID = this.getSourceFileSystem().substring(4);
        const newDescription = this.getTargetFileDescriptor();
        const sourceFS = await this.#fsFrontEnd.getWebFS(sourceUUID);
        const topRecord = await sourceFS.exportDirectoryRecord();
        const targetUUID = await this.#fsFrontEnd.buildEmpty(newDescription);
        const targetFS = await this.#fsFrontEnd.getWebFS(targetUUID);
        await targetFS.importDirectoryRecord(topRecord);
        await this.reset();
    }
    async doFileSystemRename() {
        const sourceUUID = this.getSourceFileSystem().substring(4);
        const newDescription = this.getTargetFileDescriptor();
        await this.#fsFrontEnd.setDescription(sourceUUID, newDescription);
        await this.reset();
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
    async reset() {
        this.#workbenchFileSystemSelector.clearOptions();
        await Promise.all([
            this.#workbenchFileSystemSelector.fillOptions(this.#fsFrontEnd),
            this.view.updateExistingSystemSelector(),
        ]);
        this.form.reset();
    }
}
