import WeakStrongMap from "../utilities/WeakStrongMap.js";

const UNIQUE_KEY = Symbol("unique filepath key");
const COPY_TRAVERSE_MAP = Symbol("traverse map for copy");

//#region internal types
interface LocalFileData<V extends FileSystemValue> {
  value: V;
  localName: string;
  parentKey: FileSystemWeakKey;
}

interface FileSystemWeakKey {
  readonly [UNIQUE_KEY]: number;
}

interface FSMapCopyTraversal<V extends FileSystemValue> {
  enterChild(): void;
  notifyFileData(childLeafName: string, value: V): void;
  leaveChild(): void;
}
//#region types

export interface FileSystemValue {
  /** creates a shallow copy */
  clone(): this;
}

export interface ReadonlyFileSystemMap<V extends FileSystemValue> {
  get(key: string): V | undefined;
  has(key: string): boolean;
  entries(): MapIterator<[string, V]>;
  keys(): MapIterator<string>;
  values(): MapIterator<V>;
  [Symbol.iterator](): MapIterator<[string, V]>;
}

interface WritableFileSystemMap<V extends FileSystemValue> extends ReadonlyFileSystemMap<V> {
  clear(): void;
  delete(key: string, forceRecursive: boolean): boolean;
  set(key: string, value: V): this;
  rename(parentPath: string, oldLeafName: string, newLeafName: string): boolean;
  copyFrom(
    other: FileSystemMap<V>,
    otherTreePath: string,
    localTreePath: string,
    leafName: string
  ): boolean;
}

export class FileSystemMap<V extends FileSystemValue>
implements FileSystemWeakKey, WritableFileSystemMap<V>
{
  //#region statics
  static #getPathSequence(
    pathToEntry: string
  ): string[]
  {
    if (URL.canParse(pathToEntry)) {
      const {protocol, hostname, pathname} = URL.parse(pathToEntry)!;
      return [protocol + "//", hostname, ...pathname.substring(1).split("/")].filter(Boolean);
    }

    if (pathToEntry == "")
      throw new Error("empty paths are not allowed");
    return pathToEntry.split("/");
  }

  static #joinPaths(
    parentPath: string,
    leafName: string
  ): string
  {
    if (parentPath === "" || parentPath.endsWith("://"))
      return parentPath + leafName;
    return parentPath + "/" + leafName;
  }

  static #fileEntryComparator(
    a: [string, unknown], b: [string, unknown]
  ): number
  {
    return a[0].localeCompare(b[0]);
  }

  static #topLevelEntryComparator(
    a: [string, unknown], b: [string, unknown]
  ): number
  {
    const keyA = a[0], keyB = b[0];
    const aIsProtocol = keyA.endsWith("://"), bIsProtocol = keyB.endsWith("://");
    if (aIsProtocol && !bIsProtocol)
      return +1;
    if (!aIsProtocol && bIsProtocol)
      return -1;
    return keyA.localeCompare(keyB);
  }
  //#endregion statics

  //#region internals
  public readonly [UNIQUE_KEY] = 0;

  #uniqueCounter: number = 1;
  #descendantsMap: WeakStrongMap<
    FileSystemWeakKey, string, FileSystemWeakKey
  > = new WeakStrongMap();
  #fileDataMap: WeakMap<FileSystemWeakKey, LocalFileData<V>> = new WeakMap;

  #createNewKey(): FileSystemWeakKey {
    return {
      [UNIQUE_KEY]: this.#uniqueCounter++
    };
  }

  #getPathQueue(sequence: readonly string[], mustCreate: boolean): readonly FileSystemWeakKey[] | undefined
  {
    const stack: FileSystemWeakKey[] = [this];

    let currentObject: (FileSystemWeakKey | this) = this;
    for (let i = 0; i < sequence.length; i++) {
      const localName: string = sequence[i];
      let nextKey: FileSystemWeakKey | undefined = this.#descendantsMap.get(currentObject, localName);
      if (nextKey === undefined) {
        if (mustCreate && i === sequence.length - 1) {
          nextKey = this.#createNewKey();
          this.#descendantsMap.set(currentObject, localName, nextKey);
        } else {
          return undefined;
        }
      }
      stack.push(nextKey);
      currentObject = nextKey;
    }

    return stack;
  }
  //#endregion internals

  //#region standard Map API's
  clear(): void {
    this.#descendantsMap = new WeakStrongMap;
    this.#fileDataMap = new WeakMap;
  }

  delete(key: string, forceRecursive: boolean): boolean {
    const sequence: string[] = FileSystemMap.#getPathSequence(key);
    const stack: readonly FileSystemWeakKey[] | undefined = this.#getPathQueue(sequence, false);
    if (!stack)
      return false;

    const lastKey: FileSystemWeakKey = stack.at(-1)!;
    if (!forceRecursive && this.#descendantsMap.hasStrongKeys(lastKey)) {
      throw new Error(`There are descendants of "${key}".  Use forceRecursive to clear them all out.`);
    }

    if (!this.#fileDataMap.delete(lastKey))
      return false;

    const parentKey = stack[sequence.length - 1];
    const localName = sequence.at(-1)!;
    this.#descendantsMap.delete(parentKey, localName);

    // everything underneath in the fileDataMap is now unreachable
    return true;
  }

  get(key: string): V | undefined {
    const sequence: string[] = FileSystemMap.#getPathSequence(key);
    const stack: readonly FileSystemWeakKey[] | undefined = this.#getPathQueue(sequence, false);
    if (!stack)
      return undefined;
    const lastKey: FileSystemWeakKey = stack.at(-1)!;
    return this.#fileDataMap.get(lastKey)?.value;
  }

  has(key: string): boolean {
    const sequence: string[] = FileSystemMap.#getPathSequence(key);
    const stack: readonly FileSystemWeakKey[] | undefined = this.#getPathQueue(sequence, false);
    if (!stack)
      return false;
    const lastKey: FileSystemWeakKey = stack.at(-1)!;
    return this.#fileDataMap.has(lastKey);
  }

  set(key: string, value: V): this {
    const sequence: string[] = FileSystemMap.#getPathSequence(key);
    const stack: readonly FileSystemWeakKey[] | undefined = this.#getPathQueue(sequence, true);
    if (!stack) {
      throw new Error(`missing an ancestor of "${key}"`);
    }
    const lastKey: FileSystemWeakKey = stack.at(-1)!;
    let localData: LocalFileData<V> | undefined = this.#fileDataMap.get(lastKey);

    if (localData) {
      localData.value = value;
    }
    else {
      localData = {
        value,
        localName: sequence.at(-1)!,
        parentKey: stack.at(-2)!,
      };
      this.#fileDataMap.set(lastKey, localData);
    }

    return this;
  }

  entries(): MapIterator<[string, V]> {
    return this[Symbol.iterator]();
  }

  * keys(): MapIterator<string> {
    for (const [key] of this[Symbol.iterator]()) {
      yield key;
    }
  }

  * values(): MapIterator<V> {
    for (const [key, value] of this[Symbol.iterator]())
      yield value;
  }

  [Symbol.iterator](): MapIterator<[string, V]> {
    return this.#recursiveEntries(this, "");
  }

  * #recursiveEntries(
    parentKey: FileSystemWeakKey,
    parentPath: string,
  ): IterableIterator<[string, V]>
  {
    const entries: [string, FileSystemWeakKey][] = Array.from(
      this.#descendantsMap.entriesFor(parentKey)
    );
    if (entries.length === 0)
      return;

    const isTopLevel = parentKey === this;
    entries.sort(
      isTopLevel ?
      FileSystemMap.#topLevelEntryComparator :
      FileSystemMap.#fileEntryComparator
    );

    for (const [localName, fileKey] of entries) {
      const fileData = this.#fileDataMap.get(fileKey)!;
      const fullPath: string = FileSystemMap.#joinPaths(parentPath, localName);

      yield [fullPath, fileData.value];
      yield * this.#recursiveEntries(fileKey, fullPath);
    }
  }

  //#endregion standard Map API's

  rename(parentPath: string, oldLeafName: string, newLeafName: string): boolean
  {
    if (!parentPath || !oldLeafName || !newLeafName)
      throw new Error("all arguments must be non-empty");
    if (oldLeafName.includes("/") || newLeafName.includes("/"))
      throw new Error("no slashes in renames"); // we'll deal with that if we need to
    if (oldLeafName.startsWith(".") || newLeafName.startsWith(".")) {
      throw new Error("leaf names cannot start with a dot");
    }
    const sequence: string[] = FileSystemMap.#getPathSequence(parentPath);
    const stack: readonly FileSystemWeakKey[] | undefined = this.#getPathQueue(sequence, false);
    if (!stack)
      return false;

    const lastParentKey: FileSystemWeakKey = stack.at(-1)!;
    if (this.#descendantsMap.has(lastParentKey, newLeafName))
      return false;
    const keyToMove: FileSystemWeakKey | undefined = this.#descendantsMap.get(lastParentKey, oldLeafName);
    if (!keyToMove)
      return false;

    this.#descendantsMap.set(lastParentKey, newLeafName, keyToMove);
    this.#descendantsMap.delete(lastParentKey, oldLeafName);

    this.#fileDataMap.get(keyToMove)!.localName = newLeafName;
    return true;
  }

  //#region copying API's

  copyFrom(
    other: FileSystemMap<V>,
    otherTreePath: string,
    localTreePath: string,
    leafName: string
  ): boolean
  {
    const thisSequence: string[] = FileSystemMap.#getPathSequence(localTreePath);
    const stack: FileSystemWeakKey[] | undefined = this.#getPathQueue(thisSequence, false)?.slice();
    if (!stack)
      return false;

    // avoid a collision
    if (this.#descendantsMap.has(stack.at(-1)!, leafName))
      return false;

    if (!other.has(FileSystemMap.#joinPaths(otherTreePath, leafName)))
      return false;

    const traversal: FSMapCopyTraversal<V> = {
      enterChild: () => stack.push(this.#createNewKey()),
      leaveChild: () => stack.pop(),

      notifyFileData: (localName: string, value: V) => {
        const parentKey = stack.at(-2)!, childKey = stack.at(-1)!;
        this.#descendantsMap.set(parentKey, localName, childKey);
        this.#fileDataMap.set(childKey, {
          value,
          localName,
          parentKey,
        });
      }
    };

    other[COPY_TRAVERSE_MAP](otherTreePath, leafName, traversal);
    return true;
  }

  [COPY_TRAVERSE_MAP](
    localTreeKey: string,
    childName: string,
    traversal: FSMapCopyTraversal<V>
  ): void
  {
    const thisSequence: string[] = FileSystemMap.#getPathSequence(localTreeKey);
    const stack: readonly FileSystemWeakKey[] | undefined = this.#getPathQueue(thisSequence, false)
    if (!stack)
      return;
    this.#copyTraversalMap(stack.at(-1)!, [childName], traversal);
  }

  #copyTraversalMap(
    localTreeKey: FileSystemWeakKey,
    childNames: readonly string[],
    traversal: FSMapCopyTraversal<V>
  ): void
  {
    for (const leafName of childNames) {
      traversal.enterChild();

      const childKey: FileSystemWeakKey = this.#descendantsMap.get(localTreeKey, leafName)!;
      const localData: LocalFileData<V> = this.#fileDataMap.get(childKey)!;
      traversal.notifyFileData(localData.localName, localData.value.clone());

      const grandchildKeys: Set<string> = this.#descendantsMap.strongKeysFor(childKey);
      if (grandchildKeys.size > 0) {
        this.#copyTraversalMap(childKey, Array.from(grandchildKeys), traversal);
      }
      traversal.leaveChild();
    }
  }

  //#endregion copying API's

  get [Symbol.toStringTag](): string {
    return "FileSystemMap";
  }
}
