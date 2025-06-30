import type {
  Jsonifiable
} from "type-fest";

export class JSONMap<V extends Jsonifiable> extends Map<string, V> {
  static #encoder = new TextEncoder();
  static #decoder = new TextDecoder();
  readonly #fileHandle: FileSystemSyncAccessHandle;

  constructor(
    fileHandle: FileSystemSyncAccessHandle
  )
  {
    super();
    this.#fileHandle = fileHandle;
    this.refresh();
  }

  refresh(): void {
    const buffer = new Uint8Array();
    this.#fileHandle.read(buffer, { at: 0 });
    let text = JSONMap.#decoder.decode(buffer);
    if (text[0] !== "{")
      text = "{}";
    const object = JSON.parse(text) as Record<string, V>;

    this.clear();
    for (const [key, value] of Object.entries(object)) {
      this.set(key, value);
    }
  }

  commit(): void {
    this.#fileHandle.truncate(0);
    const data: string = JSON.stringify(Object.fromEntries(this));
    const buffer = new Uint8Array(JSONMap.#encoder.encode(data));
    this.#fileHandle.write(buffer);
  }

  close(): void {
    this.#fileHandle.close();
  }
}
