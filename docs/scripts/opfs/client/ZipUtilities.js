var _a;
import { unzip, zip } from "../../../lib/packages/fflate.js";
class ZipUtilitiesImpl {
    static #decoder = new TextDecoder;
    static #encoder = new TextEncoder;
    async extractFromZip(zipFile) {
        const buffer = await zipFile.arrayBuffer();
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
        unzip(new Uint8Array(buffer), { filter }, resultFn);
        const fileRecords = await deferred.promise;
        const topRecord = {
            packages: {},
            urls: {}
        };
        for (const [pathToFile, contents] of Object.entries(fileRecords)) {
            const parts = pathToFile.split("/");
            const leafName = parts.pop(), headName = parts.shift();
            let record;
            if (headName === "packages") {
                record = topRecord.packages;
            }
            else if (headName === "urls") {
                record = topRecord.urls;
            }
            else {
                continue;
            }
            for (const part of parts) {
                record[part] ??= {};
                record = record[part];
            }
            record[leafName] = _a.#decoder.decode(contents);
        }
        return topRecord;
    }
    async buildZipFile(topDir) {
        const zipEntries = [];
        this.#recursiveArrayMap(topDir.packages, "packages", zipEntries);
        this.#recursiveArrayMap(topDir.urls, "urls", zipEntries);
        const deferred = Promise.withResolvers();
        const resultFn = (err, zipped) => {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(zipped);
        };
        zip(Object.fromEntries(zipEntries), resultFn);
        const zipUint8 = await deferred.promise;
        return new File([zipUint8], "exported-files.zip", { type: "application/zip" });
    }
    #recursiveArrayMap(dir, pathToDir, zipEntries) {
        for (const [leafName, contentsOrSubdir] of Object.entries(dir)) {
            const pathToEntry = pathToDir + "/" + leafName;
            if (typeof contentsOrSubdir === "string") {
                zipEntries.push([pathToEntry, _a.#encoder.encode(contentsOrSubdir)]);
            }
            else {
                this.#recursiveArrayMap(contentsOrSubdir, pathToEntry, zipEntries);
            }
        }
    }
}
_a = ZipUtilitiesImpl;
export const ZipUtilities = new ZipUtilitiesImpl();
