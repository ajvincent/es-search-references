import path from "node:path";

import {
  series,
} from "gulp";

import {
  InvokeTSC
} from "./build-utilities/dist/source/InvokeTSC.js";

import {
  projectRoot
} from "./build-utilities/dist/source/constants.js";


async function build(): Promise<void> {
  await InvokeTSC(path.join(projectRoot, "tsconfig.json"), []);
}

export default series([
  build
]);
