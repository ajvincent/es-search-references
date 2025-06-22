const rootDir = await navigator.storage.getDirectory();
const ProjectDir = await rootDir.getDirectoryHandle("es-search-references", { create: true });
export { ProjectDir };
