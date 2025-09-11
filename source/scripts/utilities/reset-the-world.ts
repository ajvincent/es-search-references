class ClearAllStorage {
  constructor() {
    document.getElementById("clearAllFiles")!.onclick = this.#clearAllFiles.bind(this);
  }

  async #clearAllFiles(event: Event): Promise<void> {
    const button = event.target as HTMLButtonElement;
    button.disabled = true;

    const topDir: FileSystemDirectoryHandle = await navigator.storage.getDirectory();
    const keySet = new Set(await Array.fromAsync(topDir.keys()));
    if (keySet.has("es-search-references"))
      await topDir.removeEntry("es-search-references", { recursive: true });

    const p = document.getElementById("allFilesCleared") as HTMLParagraphElement;
    p.append("All es-search-reference file systems have been removed.  You may close this webpage, or return to the previous page to re-initialize.");
  }
}
void(new ClearAllStorage());
