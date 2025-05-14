import {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

import {
  unzip
} from "../../../lib/packages/fflate.js";

export class FileUploadsView implements BaseView {
  displayElement: HTMLFormElement;

  #fileUploadPicker: HTMLInputElement;

  constructor() {
    this.displayElement = document.getElementById("file-system-controls-grid") as HTMLFormElement;
    this.#fileUploadPicker = this.displayElement.elements.namedItem("file-upload-picker") as HTMLInputElement;
  }

  async getFiles(): Promise<void> {
    const firstFile: Uint8Array = await this.#fileUploadPicker.files![0]!.bytes();
    const deferred = Promise.withResolvers<Record<string, Uint8Array>>();
    unzip(firstFile, (err, unzipped) => {
      if (err)
        deferred.reject(err);
      else
        deferred.resolve(unzipped);
    });
    const fileRecords: Record<string, Uint8Array> = await deferred.promise;
    const decoder = new TextDecoder;
    const fileMap = new Map(Object.entries(fileRecords).map(([pathToFile, contentsArray]) => {
      return [pathToFile, decoder.decode(contentsArray)]
    }));
  }
}
