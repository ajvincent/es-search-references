import { FileSystemSetView, ValidFileOperations } from "./views/fs-set.js";
import { ReferenceSpecRecord } from "../reference-spec/WebFileSystem.js";
import { ZipUtilities } from "../opfs/client/ZipUtilities.js";
export { ValidFileOperations };
export class FileSystemSetController {
    static referenceFSLabel = "Reference-spec file system";
    #fsFrontEnd;
    view;
    #workbenchFileSystemSelector;
    constructor(fsFrontEnd, workbenchFileSystemSelector) {
        this.#fsFrontEnd = fsFrontEnd;
        this.view = new FileSystemSetView(fsFrontEnd);
        this.#workbenchFileSystemSelector = workbenchFileSystemSelector;
        this.#attachEvents();
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
    #attachEvents() {
        this.view.fileUploadPicker.onchange = this.#handleFileUploadPick.bind(this);
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
    async doFileSystemUpload() {
        const topRecord = await this.getFileEntries();
        const refsDir = topRecord.packages["es-search-references"] = {};
        topRecord.packages["es-search-references"].guest = refsDir.guest;
        const newDescription = this.getTargetFileDescriptor();
        const targetUUID = await this.#fsFrontEnd.buildEmpty(newDescription);
        const targetFS = await this.#fsFrontEnd.getWebFS(targetUUID);
        await targetFS.importDirectoryRecord(topRecord);
        await this.reset();
    }
    async #handleFileUploadPick(event) {
        event.preventDefault();
        this.view.submitButton.disabled = true;
        try {
            await this.getFileEntries();
            this.view.fileUploadPicker.setCustomValidity("");
        }
        catch (ex) {
            this.view.fileUploadPicker.setCustomValidity("ZIP file is not valid for upload.  Check the contents of the ZIP file to ensure they match the specification below.");
        }
        finally {
            this.view.submitButton.disabled = false;
        }
    }
    async getFileEntries() {
        const zipFile = this.view.fileUploadPicker.files[0];
        return await ZipUtilities.extractFromZip(zipFile);
    }
    async getExportedFilesZip() {
        const sourceUUID = this.getSourceFileSystem().substring(4);
        const sourceFS = await this.#fsFrontEnd.getWebFS(sourceUUID);
        const topRecord = await sourceFS.exportDirectoryRecord();
        return await ZipUtilities.buildZipFile(topRecord);
    }
    async reset() {
        this.#workbenchFileSystemSelector.clearOptions();
        await Promise.all([
            this.#workbenchFileSystemSelector.fillOptions(this.#fsFrontEnd),
            this.view.updateExistingSystemSelector(),
        ]);
        this.form.reset();
    }
}
