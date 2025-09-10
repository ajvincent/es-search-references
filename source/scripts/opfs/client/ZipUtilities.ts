import type {
  FlateCallback,
  UnzipCallback,
  UnzipFileFilter,
} from "fflate";

import {
  unzip,
  zip
} from "../../../lib/packages/fflate.js";

import type {
  DirectoryRecord,
  TopDirectoryRecord
} from "../types/WebFileSystemIfc.js";

class ZipUtilitiesImpl {
  static readonly #decoder = new TextDecoder;
  static readonly #encoder = new TextEncoder;

  async extractFromZip(
    zipFile: File
  ): Promise<TopDirectoryRecord>
  {
    const buffer: ArrayBuffer = await zipFile.arrayBuffer();

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
    unzip(new Uint8Array(buffer), { filter }, resultFn);
    const fileRecords: Record<string, Uint8Array> = await deferred.promise;

    const topRecord: TopDirectoryRecord = {
      packages: {},
      urls: {}
    };

    for (const [pathToFile, contents] of Object.entries(fileRecords)) {
      const parts: string[] = pathToFile.split("/");
      const leafName = parts.pop()!, headName = parts.shift();

      let record: DirectoryRecord;
      if (headName === "packages") {
        record = topRecord.packages;
      } else if (headName === "urls") {
        record = topRecord.urls;
      } else {
        continue;
      }

      for (const part of parts) {
        record[part] ??= {};
        record = record[part] as DirectoryRecord;
      }

      record[leafName] = ZipUtilitiesImpl.#decoder.decode(contents);
    }

    return topRecord;
  }

  async buildZipFile(
    topDir: TopDirectoryRecord
  ): Promise<File>
  {
    const zipEntries: [string, Uint8Array][] = [];
    this.#recursiveArrayMap(topDir.packages, "packages", zipEntries);
    this.#recursiveArrayMap(topDir.urls, "urls", zipEntries);

    const deferred = Promise.withResolvers<Uint8Array<ArrayBuffer>>();
    const resultFn: FlateCallback = (err, zipped) => {
      if (err)
        deferred.reject(err);
      else
        deferred.resolve(zipped as Uint8Array<ArrayBuffer>);
    }

    zip(Object.fromEntries(zipEntries), resultFn);
    const zipUint8: Uint8Array<ArrayBuffer> = await deferred.promise;

    return new File([zipUint8], "exported-files.zip", { type: "application/zip" });
  }

  #recursiveArrayMap(
    dir: DirectoryRecord,
    pathToDir: string,
    zipEntries: [string, Uint8Array][]
  ): void
  {
    for (const [leafName, contentsOrSubdir] of Object.entries(dir)) {
      const pathToEntry = pathToDir + "/" + leafName;
      if (typeof contentsOrSubdir === "string") {
        zipEntries.push([pathToEntry, ZipUtilitiesImpl.#encoder.encode(contentsOrSubdir)]);
      } else {
        this.#recursiveArrayMap(contentsOrSubdir, pathToEntry, zipEntries);
      }
    }
  }
}
export const ZipUtilities = new ZipUtilitiesImpl();
