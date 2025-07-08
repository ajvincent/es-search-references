import fs from "node:fs/promises";
import path from "node:path";
import type {
  Dirent
} from "node:fs";

import {
  dest,
  parallel,
  series,
  src,
} from "gulp";

import replace from "gulp-replace";

import {
  InvokeTSC
} from "./build-utilities/dist/source/InvokeTSC.js";

import {
  PromiseAllParallel,
} from "./build-utilities/dist/source/PromiseTypes.js";

import {
  projectRoot
} from "./build-utilities/dist/source/constants.js";

import {
  asyncFork
} from "./build-utilities/dist/source/childProcess.js";

import type {
  TopDirectoryRecord,
  DirectoryRecord
} from "./source/scripts/opfs/types/WebFileSystemIfc.js";

async function buildLocalhost(): Promise<void> {
  await InvokeTSC(path.join(projectRoot, "tsconfig-localhost.json"), []);
}

function installEngine262(): Promise<void> {
  return fs.cp(
    path.join(projectRoot, "node_modules/@engine262/engine262/lib/engine262.mjs"),
    path.join(projectRoot, "docs/lib/packages/engine262.mjs")
  );
}

function installFFlate(): Promise<void> {
  return fs.cp(
    path.join(projectRoot, "node_modules/fflate/esm/browser.js"),
    path.join(projectRoot, "docs/lib/packages/fflate.js")
  );
}

function installSearchReferencesJs() {
  return src("es-search-references/dist/core-host/runSearchesInGuestEngine.js")
    .pipe(replace("@engine262/engine262", "./engine262.mjs"))
    .pipe(replace(
      `import graphlib from '@dagrejs/graphlib';\n`,
      `
import { dagre } from "./dagre-imports.js";
const { graphlib } = dagre;
      `.trim() + "\n"
    ))
    .pipe(dest("docs/lib/packages"));
}

function installSearchReferences_d_ts() {
  return src("es-search-references/dist/core-host/runSearchesInGuestEngine.d.ts")
    .pipe(replace("@engine262/engine262", "./engine262.mjs"))
    .pipe(replace("@dagrejs/graphlib", "./dagre-imports.js"))
    .pipe(dest("source/lib/packages"));
}

async function installReferenceSpecsOld(): Promise<void> {
  const files: string[] = (await fs.readdir(path.join(projectRoot, "dist"), { recursive: true })).filter(
    f => (f.startsWith("fixtures") || f.startsWith("reference-spec")) && f.endsWith(".js")
  );

  const fileEntries: [string, string][] = await PromiseAllParallel(files, async f => [
    "virtual://home/" + f, await fs.readFile(path.join(projectRoot, "dist", f), { encoding: "utf-8"})
  ]);
  fileEntries.unshift([
    `es-search-references/guest`,
    `
/*
declare function searchReferences(
  this: void,
  resultsKey: string,
  targetValue: WeakKey,
  heldValues: readonly WeakKey[],
  strongReferencesOnly: boolean,
): void;
*/
export {};
    `.trim() + "\n"
  ])

  const serialized = JSON.stringify(fileEntries);
  const moduleSource = `
import {
  FileSystemMap
} from "../storage/FileSystemMap.js";
export const ReferenceSpecFileMap = new FileSystemMap("reference-spec-filesystem", ${serialized});
`.trim();

  await fs.writeFile(
    path.join(projectRoot, "docs/scripts/reference-spec/FileMap.js"),
    moduleSource,
    { encoding: "utf-8"}
  );
}

async function installReferenceSpecs(): Promise<void> {
  const guestContents = `
/*
declare function searchReferences(
  this: void,
  resultsKey: string,
  targetValue: WeakKey,
  heldValues: readonly WeakKey[],
  strongReferencesOnly: boolean,
): void;
*/
export {};
  `.trim() + "\\n";

  const topDir = {
    packages: {
      "es-search-references": {
        "guest": guestContents,
      }
    },
    urls: {
      "virtual": {
        "home": {
          "fixtures": {
          },
          "reference-spec": {
          },
        },
      },
    },
  } as TopDirectoryRecord;

  async function addDirectory(
    dirObject: DirectoryRecord,
    absolutePathToDirectory: string
  ): Promise<void>
  {
    const entries: Dirent[] = await fs.readdir(
      absolutePathToDirectory,
      { encoding: "utf-8", withFileTypes: true }
    );
    let promises = new Set<Promise<void>>();

    for (const entry of entries) {
      const { name } = entry;
      const fullPath = path.join(absolutePathToDirectory, name);
      if (entry.isDirectory()) {
        const subDirObject: DirectoryRecord = {};
        dirObject[name] = subDirObject;
        promises.add(addDirectory(subDirObject, fullPath));
      } else if (entry.isFile()) {
        let contents = await fs.readFile(fullPath, { encoding: "utf-8" });
        dirObject[name] = contents;
      }
    }
    await Promise.all(promises);
  }

  await Promise.all([
    addDirectory(
      (topDir.urls.virtual.home as DirectoryRecord)["fixtures"] as DirectoryRecord,
      path.join(projectRoot, "dist/fixtures")
    ),

    addDirectory(
      (topDir.urls.virtual.home as DirectoryRecord)["reference-spec"] as DirectoryRecord,
      path.join(projectRoot, "dist/reference-spec")
    ),
  ]);

  const sourceCode = `
const ReferenceSpecRecord = ${JSON.stringify(topDir, null, 2)};
export {
  ReferenceSpecRecord
}
  `.trim() + "\n";

  await fs.writeFile(
    path.join(projectRoot, "docs/scripts/reference-spec/WebFileSystem.js"),
    sourceCode,
    { encoding: "utf-8" }
  );
}

async function installCodeMirror(): Promise<void> {
  const rollupLocation = path.join(projectRoot, "node_modules/rollup/dist/bin/rollup");
  const pathToConfig = path.join(projectRoot, "codemirror/rollup.config.js");
  await asyncFork(rollupLocation, [
      "--config",
      pathToConfig,
    ],
    path.join(projectRoot, "codemirror")
  );
}

async function buildScripts(): Promise<void> {
  await InvokeTSC(path.join(projectRoot, "source/tsconfig.json"), []);
}

export default series([
  buildLocalhost,
  parallel([
    installEngine262,
    installFFlate,
    installSearchReferencesJs,
    installSearchReferences_d_ts,
    installReferenceSpecsOld,
    installReferenceSpecs,
    installCodeMirror,
    buildScripts,
  ]),
]);
