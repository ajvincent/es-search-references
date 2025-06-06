import {
  FileSystemSetView,
  ValidFileOperations
} from "./views/fs-set.js";

import {
  unzip
} from "../../lib/packages/fflate.js";

import type {
  UnzipCallback,
  UnzipFileFilter,
} from "fflate";

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

  getSelectedFileSystem(): string {
    return this.view.sourceSelector.value;
  }

  async getFileEntries(): Promise<[string, string][]> {
    const firstFile: Uint8Array = await this.view.fileUploadPicker.files![0]!.bytes();

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
}
