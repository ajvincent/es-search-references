import fs from "node:fs/promises";
import path from "node:path";

import {
  parallel,
  series,
} from "gulp";

import {
  InvokeTSC
} from "./build-utilities/dist/source/InvokeTSC.js";

import {
  projectRoot
} from "./build-utilities/dist/source/constants.js";

async function buildLocalhost(): Promise<void> {
  await InvokeTSC(path.join(projectRoot, "tsconfig-localhost.json"), []);
}

function installEngine262(): Promise<void> {
  return fs.cp(
    path.join(projectRoot, "node_modules/@engine262/engine262/lib/engine262.mjs"),
    path.join(projectRoot, "docs/lib/packages/engine262.mjs")
  );
}

export default series([
  buildLocalhost,
  parallel([
    installEngine262,
  ]),
]);
