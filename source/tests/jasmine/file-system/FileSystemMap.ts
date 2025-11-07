import {
  type FilePathAndDepth,
  FileSystemMap,
  type FileSystemValue,
} from "../../../scripts/file-system/FileSystemMap.js";

it("FileSystemMap sanity checks", () => {
  const spy = jasmine.createSpy("filePathAndDepth");
  class WrappedNumber implements FileSystemValue {
    #value: number;

    constructor(value: number) {
      this.#value = value;
    }
    get value(): number {
      return this.#value;
    }

    clone(): this {
      return new WrappedNumber(this.#value) as this;
    }

    updateFilePathAndDepth(filePathAndDepth: FilePathAndDepth): void {
      spy(this, filePathAndDepth.filePath, filePathAndDepth.depth);
    }
  }

  const ONE = new WrappedNumber(1);
  const TWO = new WrappedNumber(2);
  const THREE = new WrappedNumber(3);
  const FOUR = new WrappedNumber(4);
  const FIVE = new WrappedNumber(5);
  const SIX = new WrappedNumber(6);
  const SEVEN = new WrappedNumber(7);
  const EIGHT = new WrappedNumber(8);
  const NINE = new WrappedNumber(9);

  const map = new FileSystemMap<WrappedNumber>(0);
  expect(
    () => map.set("one://two/three.js", THREE)
  ).toThrowError(`missing an ancestor of "one://two/three.js"`);

  map.set("one://", ONE);
  expect(
    () => map.set("one://two/three.js", THREE)
  ).toThrowError(`missing an ancestor of "one://two/three.js"`);

  map.set("one://two", TWO);
  map.set("one://two/three.js", THREE);

  expect(map.get("one://two/three.js")).toBe(THREE);
  expect(map.get("one://two/")).toBe(TWO);
  expect(map.get("one://")).toBe(ONE);

  expect(map.has("one://two/three.js")).toBeTrue();
  expect(map.has("one://two")).toBeTrue();
  expect(map.has("one://")).toBeTrue();

  expect(
    () => map.delete("one://", false)
  ).toThrowError(`There are descendants of "one://".  Use forceRecursive to clear them all out.`);

  expect(map.delete("one://two/four.js", false)).toBeFalse();
  expect(map.delete("one://two/three.js", false)).toBeTrue();
  expect(map.get("one://two/three.js")).toBeUndefined();

  map.set("one://two/three.js", THREE);
  map.set("one://two/four.js", FOUR);

  expect(map.delete("one://two", true)).toBeTrue();
  expect(map.has("one://two/three.js")).toBeFalse();
  expect(map.get("one://two/three.js")).toBeUndefined();

  map.set("one://two", TWO);
  expect(map.has("one://two/three.js")).toBeFalse();
  expect(map.get("one://two/three.js")).toBeUndefined();

  map.set("one://two/three.js", THREE);
  map.set("one://two/four.js", FOUR);

  // up to this point we haven't done any file system moves
  expect(spy).toHaveBeenCalledTimes(0);

  map.rename("one://", "two", "five");
  expect(map.get("one://two/three.js")).toBeUndefined();
  expect(map.get("one://two/four.js")).toBeUndefined();
  expect(map.get("one://five/three.js")).toBe(THREE);
  expect(map.get("one://five/four.js")).toBe(FOUR);

  expect(spy).toHaveBeenCalledTimes(3);
  expect(spy.calls.argsFor(0)).toEqual([TWO, "one://five", 1]);
  expect(spy.calls.argsFor(1)).toEqual([THREE, "one://five/four.js", 2]);
  expect(spy.calls.argsFor(1)).toEqual([FOUR, "one://five/four.js", 2]);
  spy.calls.reset();

  map.clear();
  expect(map.get("one://two/three.js")).toBeUndefined();
  expect(map.get("one://two/four.js")).toBeUndefined();
  expect(map.get("one://five/three.js")).toBeUndefined();
  expect(map.get("one://five/four.js")).toBeUndefined();

  map.set("one://", ONE);
  map.set("one://two", TWO);
  map.set("one://two/three.js", THREE);
  map.set("one://two/four.js", FOUR);
  map.set("one://five", FIVE);
  map.set("one://five/six.js", SIX);

  map.set("seven", SEVEN);
  map.set("seven/eight", EIGHT)
  map.set("nine", NINE);

  let allEntries = Array.from(map.entries());
  expect(allEntries).toEqual([
    ["nine", NINE],
    ["seven", SEVEN],
    ["seven/eight", EIGHT],
    ["one://", ONE],
    ["one://five", FIVE],
    ["one://five/six.js", SIX],
    ["one://two", TWO],
    ["one://two/four.js", FOUR],
    ["one://two/three.js", THREE],
  ]);

  {
    const { filePath, depth }: FilePathAndDepth = map.filePathAndDepth(SIX);
    expect(filePath).toBe("one://five/six.js");
    expect(depth).toBe(2);
  }

  map.rename("one://", "five", "zero");

  expect(spy).toHaveBeenCalledTimes(2);
  expect(spy.calls.argsFor(0)).toEqual([FIVE, "one://zero", 1]);
  expect(spy.calls.argsFor(1)).toEqual([SIX, "one://zero/six.js", 2]);
  spy.calls.reset();

  allEntries = Array.from(map.entries());
  expect(allEntries).toEqual([
    ["nine", NINE],
    ["seven", SEVEN],
    ["seven/eight", EIGHT],
    ["one://", ONE],
    ["one://two", TWO],
    ["one://two/four.js", FOUR],
    ["one://two/three.js", THREE],
    ["one://zero", FIVE],
    ["one://zero/six.js", SIX],
  ]);

  {
    const { filePath, depth }: FilePathAndDepth = map.filePathAndDepth(SIX);
    expect(filePath).toBe("one://zero/six.js");
    expect(depth).toBe(2);
  }

  map.clear();
  map.set("one://", ONE);
  map.set("one://two", TWO);
  map.set("one://two/three.js", THREE);
  map.set("one://two/four.js", FOUR);
  map.set("one://five", FIVE);
  map.set("one://five/six.js", SIX);

  map.set("seven", SEVEN);

  expect(map.copyFrom(map, "one://", "seven", "two")).toBeTrue();
  allEntries = Array.from(map.entries());
  expect(allEntries).toEqual([
    ["seven", SEVEN],
    ["seven/two", new WrappedNumber(2)],
    ["seven/two/four.js", new WrappedNumber(4)],
    ["seven/two/three.js", new WrappedNumber(3)],
    ["one://", ONE],
    ["one://five", FIVE],
    ["one://five/six.js", SIX],
    ["one://two", TWO],
    ["one://two/four.js", FOUR],
    ["one://two/three.js", THREE],
  ]);

  expect(spy).toHaveBeenCalledTimes(3);
  expect(spy.calls.argsFor(0)).toEqual([new WrappedNumber(2), "seven/two", 1]);
  expect(spy.calls.argsFor(1)).toEqual([new WrappedNumber(4), "seven/two/four.js", 2]);
  expect(spy.calls.argsFor(2)).toEqual([new WrappedNumber(3), "seven/two/three.js", 2]);
  spy.calls.reset();

  expect(map.copyFrom(map, "one://", "seven", "two")).toBeFalse();
});
