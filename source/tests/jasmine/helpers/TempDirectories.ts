
const rootDir = await navigator.storage.getDirectory();
const TempRoot = await rootDir.getDirectoryHandle("tmp", { create: true });

const CleanupSet = new Set<string>;

async function cleanupDir(name: string): Promise<void> {
  await TempRoot.removeEntry(name, { recursive: true });
  CleanupSet.delete(name);
  if (CleanupSet.size === 0)
    await rootDir.removeEntry("tmp", { recursive: true });
}

export function getTempDirAndCleanup(
  name: string
): Promise<FileSystemDirectoryHandle>
{
  CleanupSet.add(name);
  const dirPromise = TempRoot.getDirectoryHandle(name, { create: true });
  afterAll(async () => {
    await dirPromise.then(() => cleanupDir(name));
  });
  return dirPromise;
}

export function getResolvedTempDirPath(
  name: string
): string
{
  return "tmp/" + name;
}
