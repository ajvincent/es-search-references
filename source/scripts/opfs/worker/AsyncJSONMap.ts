import type {
  Jsonifiable
} from "type-fest";

export class AsyncJSONMap<K extends string, V extends Jsonifiable> extends Map<K, V> {
  static async build<K extends string, V extends Jsonifiable>(
    fileHandle: FileSystemFileHandle
  ): Promise<AsyncJSONMap<K, V>>
  {
    const entries = await this.#readMap<K, V>(fileHandle);
    return new AsyncJSONMap<K, V>(fileHandle, entries);
  }

  static async #readMap<K extends string, V extends Jsonifiable>(
    fileHandle: FileSystemFileHandle
  ): Promise<[K, V][]>
  {
    const file = await fileHandle.getFile();
    let text = await file.text();
    if (text[0] !== "{")
      text = "{}";
    const object = JSON.parse(text) as Record<K, V>;
    return Object.entries(object) as [K, V][];
  }

  readonly #fileHandle: FileSystemFileHandle;

  private constructor(
    fileHandle: FileSystemFileHandle,
    entries: [K, V][]
  )
  {
    super(entries);
    this.#fileHandle = fileHandle;
  }

  async refresh(): Promise<void> {
    this.clear();
    for (const [key, value] of await AsyncJSONMap.#readMap<K, V>(this.#fileHandle)) {
      this.set(key, value);
    }
  }

  async commit(): Promise<void> {
    const writable = await this.#fileHandle.createWritable();
    await writable.write(JSON.stringify(Object.fromEntries(this)));
    await writable.close();
  }
}
