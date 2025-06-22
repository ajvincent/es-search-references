import {
  installReferenceSpecs
} from "../../../scripts/reference-spec/WebFileSystem.js";

import {
  FileSystemManager
} from "../../../scripts/storage/FileSystemManager.js";

import type {
  FileSystemManagerIfc
} from "../../../scripts/storage/types/FileSystemManagerIfc.js";

import type {
  WebFileSystemIfc
} from "../../../scripts/storage/types/WebFileSystemIfc.js";

let ReferencesWebFS: Promise<WebFileSystemIfc>;

export async function getReferenceWebFS(): Promise<WebFileSystemIfc> {
  if (!ReferencesWebFS)
    ReferencesWebFS = buildReferenceWebFS();
  return ReferencesWebFS;
}

async function buildReferenceWebFS(): Promise<WebFileSystemIfc> {
  const rootDir = await navigator.storage.getDirectory();
  const referencesRoot = await rootDir.getDirectoryHandle("references", { create: true });
  const manager: FileSystemManagerIfc = await FileSystemManager.build(referencesRoot);

  let referenceKey = "";
  for (const [key, value] of manager.availableSystems) {
    if (value === "reference-spec-filesystem") {
      referenceKey = key;
      break;
    }
  }

  let webFS: WebFileSystemIfc;
  if (referenceKey) {
    webFS = await manager.getExisting(referenceKey);
  }
  else {
    webFS = await manager.buildEmpty("reference-spec-filesystem");
    await installReferenceSpecs(webFS);
  }

  return webFS;
}
