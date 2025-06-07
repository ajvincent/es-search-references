import type {
  FlateCallback,
  UnzipCallback,
  UnzipFileFilter,
} from "fflate";

import {
  FileSystemSetView,
  ValidFileOperations
} from "./views/fs-set.js";

import {
  unzip,
  zip
} from "../../lib/packages/fflate.js";

import type {
  ExportedFileSystem,
  FileSystemMap
} from "../storage/FileSystemMap.js";

export {
  ValidFileOperations
};

export class FileSystemSetController {
  static readonly #decoder = new TextDecoder;

  readonly view = new FileSystemSetView();

  get form(): HTMLFormElement {
    return this.view.displayElement;
  }

  get selectedOperation(): ValidFileOperations | undefined {
    return this.view.selectedOperation;
  }

  getSourceFileSystem(): string {
    return this.view.sourceSelector.value;
  }

  getTargetFileSystem(): string {
    return this.view.targetInput.value;
  }

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

  reset(): void {
    this.view.updateExistingSystemSelector();
    this.form.reset();
  }
}
