import type {
  Jsonifiable
} from "type-fest";

export class AsyncJSONMap<V extends Jsonifiable> extends Map<string, V> {
  static async build<V extends Jsonifiable>(fileHandle: FileSystemFileHandle): Promise<AsyncJSONMap<V>> {
    const entries = await this.#readMap<V>(fileHandle);
    return new AsyncJSONMap<V>(fileHandle, entries);
  }

  static async #readMap<V extends Jsonifiable>(fileHandle: FileSystemFileHandle): Promise<[string, V][]> {
    const file = await fileHandle.getFile();
    let text = await file.text();
    if (text[0] !== "{")
      text = "{}";
    const object = JSON.parse(text) as Record<string, V>;
    return Object.entries(object);
  }

  readonly #fileHandle: FileSystemFileHandle;

  private constructor(
    fileHandle: FileSystemFileHandle,
    entries: [string, V][]
  )
  {
    super(entries);
    this.#fileHandle = fileHandle;
  }

  async refresh(): Promise<void> {
    this.clear();
    for (const [key, value] of await AsyncJSONMap.#readMap<V>(this.#fileHandle)) {
      this.set(key, value);
    }
  }

  async commit(): Promise<void> {
    const writable = await this.#fileHandle.createWritable();
    await writable.write(JSON.stringify(Object.fromEntries(this)));
    await writable.close();
  }
}
