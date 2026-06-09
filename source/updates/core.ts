import fs from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";
import {
  argv
} from "node:process";

import {
  checkPackage
} from "./checkPackage.js";

import {
  synchronizeDirectories
} from "#build-utilities/dist/source/synchronizeDirectories.js";

const coreRoot = path.normalize(argv.at(-1)!);
await checkPackage(coreRoot, "es-search-references");

const projectRoot = path.normalize(path.join(fileURLToPath(import.meta.url), "../../../.."));

/* It would be easier if I just published the es-search-references package, but there's two problems with that:
(1) It depends on engine262, and that has never published a stable version.  (Probably never will.)
(2) This would miss the fixtures and reference-specs directories, which may also get updates.
*/

async function syncDirsWithTS(localPath: string): Promise<void> {
  await synchronizeDirectories(
    path.join(coreRoot, localPath),
    path.join(projectRoot, localPath),
  );

  // @ts-ignore
  const jsFiles: readonly string[] = await Array.fromAsync(fs.glob("**/*.js", {
    cwd: path.join(coreRoot, localPath)
  }));
  await Promise.all(jsFiles.map(f => fs.rm(path.join(coreRoot, localPath, f))))
}

await Promise.all([
  syncDirsWithTS("fixtures/OneToOneStrongMap"),
  syncDirsWithTS("reference-spec").then(async () => {
    const validateDir = path.join(projectRoot, "reference-spec/validateArguments");
    await fs.rm(validateDir, { force: true, recursive: true });
  }),

  synchronizeDirectories(
    path.join(coreRoot, "dist/core-host"),
    path.join(projectRoot, "es-search-references/dist/core-host"),
  ).then(() => console.log("core-host directory synchronized")),
]);

await fs.cp(
  path.join(coreRoot, "dist/guest/searchReferences.d.ts"),
  path.join(projectRoot, "reference-spec/searchReferences.d.ts")
).then(() => console.log("searchReferences.d.ts updated"));

await fs.cp(
  path.join(coreRoot, "dist/guest/print.d.ts"),
  path.join(projectRoot, "reference-spec/print.d.ts")
).then(() => console.log("print.d.ts updated"));
