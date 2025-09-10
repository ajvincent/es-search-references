import {
  FileSystemSetView,
  ValidFileOperations
} from "./views/fs-set.js";

import type {
  OPFSFrontEnd
} from "../opfs/client/FrontEnd.js";

import type {
  DirectoryRecord,
  OPFSWebFileSystemIfc,
  TopDirectoryRecord
} from "../opfs/types/WebFileSystemIfc.js";

import type {
  FileSystemsRecords,
  UUID
} from "../opfs/types/messages.js";

import {
  ReferenceSpecRecord
} from "../reference-spec/WebFileSystem.js";

import {
  FileSystemSelectorView
} from "../workbench-views/FileSystemSelector.js";

import {
  ZipUtilities
} from "../opfs/client/ZipUtilities.js";

export {
  ValidFileOperations
};

export class FileSystemSetController {
  static readonly referenceFSLabel = "Reference-spec file system";

  readonly #fsFrontEnd: OPFSFrontEnd;
  readonly view: FileSystemSetView;

  readonly #workbenchFileSystemSelector: FileSystemSelectorView;

  constructor(
    fsFrontEnd: OPFSFrontEnd,
    workbenchFileSystemSelector: FileSystemSelectorView
  )
  {
    this.#fsFrontEnd = fsFrontEnd;
    this.view = new FileSystemSetView(fsFrontEnd);

    this.#workbenchFileSystemSelector = workbenchFileSystemSelector;

    this.#attachEvents();
  }

  get form(): HTMLFormElement {
    return this.view.displayElement;
  }

  get selectedOperation(): ValidFileOperations | undefined {
    return this.view.selectedOperation;
  }

  getSourceFileSystem(): string {
    return this.view.sourceSelector.value;
  }

  getTargetFileDescriptor(): string {
    return this.view.targetInput.value;
  }

  #attachEvents(): void {
    this.view.fileUploadPicker.onchange = this.#handleFileUploadPick.bind(this);
  }

  public async ensureReferenceFS(): Promise<void> {
    const currentFileSystems: FileSystemsRecords = await this.#fsFrontEnd.getAvailableSystems();
    const descriptions = Object.values(currentFileSystems);
    for (const desc of descriptions) {
      if (desc === FileSystemSetController.referenceFSLabel)
        return;
    }

    const uuid = await this.#fsFrontEnd.buildEmpty(FileSystemSetController.referenceFSLabel);
    const webFS: OPFSWebFileSystemIfc = await this.#fsFrontEnd.getWebFS(uuid);

    await webFS.importDirectoryRecord(ReferenceSpecRecord);
  }

  public async getReferenceUUID(): Promise<UUID> {
    const currentFileSystems: FileSystemsRecords = await this.#fsFrontEnd.getAvailableSystems();
    for (const [uuid, desc] of Object.entries(currentFileSystems)) {
      if (desc === FileSystemSetController.referenceFSLabel)
        return uuid as UUID;
    }
    throw new Error('we should have a reference UUID by now!');
  }

  public async doFileSystemClone(): Promise<void> {
    const sourceUUID: UUID = this.getSourceFileSystem()!.substring(4) as UUID;
    const newDescription: string = this.getTargetFileDescriptor();

    const sourceFS: OPFSWebFileSystemIfc = await this.#fsFrontEnd.getWebFS(sourceUUID);
    const topRecord: TopDirectoryRecord = await sourceFS.exportDirectoryRecord();

    const targetUUID: UUID = await this.#fsFrontEnd.buildEmpty(newDescription);
    const targetFS: OPFSWebFileSystemIfc = await this.#fsFrontEnd.getWebFS(targetUUID);
    await targetFS.importDirectoryRecord(topRecord);

    await this.reset();
  }

  public async doFileSystemRename(): Promise<void> {
    const sourceUUID: UUID = this.getSourceFileSystem()!.substring(4) as UUID;
    const newDescription = this.getTargetFileDescriptor();
    await this.#fsFrontEnd.setDescription(sourceUUID, newDescription);
    await this.reset();
  }

  public async doFileSystemUpload(): Promise<void> {
    const topRecord = await this.getFileEntries();
    const refsDir: DirectoryRecord = topRecord.packages["es-search-references"] = {};
    topRecord.packages["es-search-references"].guest = refsDir.guest as string;

    const newDescription: string = this.getTargetFileDescriptor();

    const targetUUID: UUID = await this.#fsFrontEnd.buildEmpty(newDescription);
    const targetFS: OPFSWebFileSystemIfc = await this.#fsFrontEnd.getWebFS(targetUUID);
    await targetFS.importDirectoryRecord(topRecord);

    await this.reset();
  }

  async #handleFileUploadPick(event: Event): Promise<void> {
    event.preventDefault();
    this.view.submitButton.disabled = true;

    try {
      await this.getFileEntries();
      this.view.fileUploadPicker.setCustomValidity("");
    }
    catch (ex) {
      this.view.fileUploadPicker.setCustomValidity(
        "ZIP file is not valid for upload.  Check the contents of the ZIP file to ensure they match the specification below."
      );
    }
    finally {
      this.view.submitButton.disabled = false;
    }
  }

  async getFileEntries(): Promise<TopDirectoryRecord> {
    const zipFile: File = this.view.fileUploadPicker.files![0]!;
    return await ZipUtilities.extractFromZip(zipFile);
  }

  async getExportedFilesZip(): Promise<File> {
    const sourceUUID: UUID = this.getSourceFileSystem()!.substring(4) as UUID;
    const sourceFS: OPFSWebFileSystemIfc = await this.#fsFrontEnd.getWebFS(sourceUUID);
    const topRecord: TopDirectoryRecord = await sourceFS.exportDirectoryRecord();

    return await ZipUtilities.buildZipFile(topRecord);
  }

  async reset(): Promise<void> {
    this.#workbenchFileSystemSelector.clearOptions();

    await Promise.all([
      this.#workbenchFileSystemSelector.fillOptions(this.#fsFrontEnd),
      this.view.updateExistingSystemSelector(),
    ]);

    this.form.reset();
  }
}
