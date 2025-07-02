import type {
  Jsonifiable
} from "type-fest";

export class JSONMap<
  K extends string,
  V extends Jsonifiable
> extends Map<K, V>
{
  static #encoder = new TextEncoder();
  static #decoder = new TextDecoder();
  readonly #fileHandle: FileSystemSyncAccessHandle;

  constructor(
    fileHandle: FileSystemSyncAccessHandle
  )
  {
    super();
    this.#fileHandle = fileHandle;

    const buffer = new Uint8Array();
    this.#fileHandle.read(buffer, { at: 0 });
    let text = JSONMap.#decoder.decode(buffer);
    if (text[0] !== "{")
      text = "{}";
    const object = JSON.parse(text) as Record<K, V>;

    this.clear();
    for (const [key, value] of Object.entries(object)) {
      this.set(key as K, value as V);
    }
  }

  clear(): void {
    super.clear();
    this.#commit();
  }

  delete(key: K): boolean {
    const rv = super.delete(key);
    this.#commit();
    return rv;
  }

  set(key: K, value: V): this {
    super.set(key, value);
    this.#commit();
    return this;
  }

  #commit(): void {
    this.#fileHandle.truncate(0);
    const data: string = JSON.stringify(Object.fromEntries(this));
    const buffer = new Uint8Array(JSONMap.#encoder.encode(data));
    this.#fileHandle.write(buffer, { at: 0});
  }

  close(): void {
    this.#fileHandle.close();
  }
}
