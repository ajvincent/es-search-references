import {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

import {
  unzip
} from "../../../lib/packages/fflate.js";

import type {
  UnzipCallback,
  UnzipFileFilter,
} from "fflate";

export class FileUploadsView implements BaseView {
  static readonly #decoder = new TextDecoder

  readonly displayElement: HTMLFormElement;

  readonly #fileUploadPicker: HTMLInputElement;
  readonly #uploadRoot: HTMLInputElement;
  readonly #fileSystemSelector: HTMLInputElement;

  constructor() {
    this.displayElement = document.getElementById("file-system-upload-form") as HTMLFormElement;
    const { elements } = this.displayElement;
    this.#fileUploadPicker = elements.namedItem("file-upload-picker") as HTMLInputElement;
    this.#uploadRoot = elements.namedItem("file-upload-root") as HTMLInputElement;
    this.#fileSystemSelector = elements.namedItem("file-system-upload-selector") as HTMLInputElement;
  }

  getSelectedFileSystem(): string {
    return this.#fileSystemSelector.value;
  }

  async getFileEntries(): Promise<[string, string][]> {
    const firstFile: Uint8Array = await this.#fileUploadPicker.files![0]!.bytes();
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

    const prefix = this.#uploadRoot.value;
    return Object.entries(fileRecords).map(
      ([pathToFile, contentsArray]) => [prefix + pathToFile, FileUploadsView.#decoder.decode(contentsArray)]
    );
  }
}
