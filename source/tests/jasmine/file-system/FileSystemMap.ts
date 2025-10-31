import {
  FileSystemMap,
  type FileSystemValue,
} from "../../../scripts/file-system/FileSystemMap.js";

it("FileSystemMap sanity checks", () => {
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

  const map = new FileSystemMap<WrappedNumber>;
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

  map.rename("one://", "two", "five");
  expect(map.get("one://two/three.js")).toBeUndefined();
  expect(map.get("one://two/four.js")).toBeUndefined();
  expect(map.get("one://five/three.js")).toBe(THREE);
  expect(map.get("one://five/four.js")).toBe(FOUR);

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

  map.rename("one://", "five", "zero");

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

  expect(map.copyFrom(map, "one://", "seven", "two")).toBeFalse();
});
