import type {
  Jsonifiable
} from "type-fest";

import {
  FileSystemUtilities
} from "./FSUtilities.js";

export class JSONMap<
  K extends string,
  V extends Jsonifiable
> extends Map<K, V>
{
  static async build<K extends string, V extends Jsonifiable>(
    fileHandle: FileSystemFileHandle
  ): Promise<JSONMap<K, V>>
  {
    const initialText = await FileSystemUtilities.readFile(fileHandle);
    return new JSONMap<K, V>(fileHandle, initialText);
  }

  readonly #fileHandle: FileSystemFileHandle;

  private constructor(
    fileHandle: FileSystemFileHandle,
    initialText: string
  )
  {
    super();
    this.#fileHandle = fileHandle;

    if (initialText[0] !== "{")
      initialText = "{}";
    const object = JSON.parse(initialText) as Record<K, V>;

    for (const [key, value] of Object.entries(object)) {
      super.set(key as K, value as V);
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

  #commit(): Promise<void> {
    const data: string = JSON.stringify(Object.fromEntries(this));
    return FileSystemUtilities.writeFile(this.#fileHandle, data);
  }
}
