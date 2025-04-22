import fs from "node:fs/promises";
import path from "node:path";

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

async function buildLocalhost(): Promise<void> {
  await InvokeTSC(path.join(projectRoot, "tsconfig-localhost.json"), []);
}

function installEngine262(): Promise<void> {
  return fs.cp(
    path.join(projectRoot, "node_modules/@engine262/engine262/lib/engine262.mjs"),
    path.join(projectRoot, "docs/lib/packages/engine262.mjs")
  );
}

async function installGraphLib(): Promise<void> {
  const rollupLocation = path.join(projectRoot, "node_modules/rollup/dist/bin/rollup");
  const pathToConfig = path.join(projectRoot, "graphlib-rollup.config.js");
  await asyncFork(rollupLocation, [
      "--config",
      pathToConfig,
    ],
    projectRoot
  );
}

function installSearchReferencesJs() {
  return src("es-search-references/dist/core-host/runSearchesInGuestEngine.js")
    .pipe(replace("@engine262/engine262", "./engine262.mjs"))
    .pipe(replace("@dagrejs/graphlib", "./graphlib.mjs"))
    .pipe(dest("docs/lib/packages"));
}

function installSearchReferences_d_ts() {
  return src("es-search-references/dist/core-host/runSearchesInGuestEngine.d.ts")
    .pipe(replace("@engine262/engine262", "./engine262.mjs"))
    .pipe(replace("@dagrejs/graphlib", "./graphlib.mjs"))
    .pipe(dest("source/lib/packages"));
}

async function installReferenceSpecs(): Promise<void> {
  const files: string[] = (await fs.readdir(path.join(projectRoot, "dist"), { recursive: true })).filter(
    f => (f.startsWith("fixtures") || f.startsWith("reference-spec")) && f.endsWith(".js")
  );

  const fileEntries: [string, string][] = await PromiseAllParallel(files, async f => [
    "virtual://home/" + f, await fs.readFile(path.join(projectRoot, "dist", f), { encoding: "utf-8"})
  ]);

  const serialized = JSON.stringify(fileEntries);
  const moduleSource = `export const ReferenceSpecFileMap = new Map(JSON.parse(${serialized}));\n`;

  await fs.writeFile(
    path.join(projectRoot, "docs/scripts/ReferenceSpecFileMap.js"),
    moduleSource,
    { encoding: "utf-8"}
  );
}

async function buildScripts(): Promise<void> {
  await InvokeTSC(path.join(projectRoot, "source/tsconfig.json"), []);
}

export default series([
  buildLocalhost,
  parallel([
    installEngine262,
    installGraphLib,
    installSearchReferencesJs,
    installSearchReferences_d_ts,
    installReferenceSpecs,
    buildScripts,
  ]),
]);
