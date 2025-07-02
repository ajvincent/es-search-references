import {
  ParentChildMap
} from "../../../scripts/utilities/ParentChildMap.js";

describe("ParentChildMap", () => {
  const map = new ParentChildMap<string, { key: string }>;
  beforeEach(() => map.clear());

  it(".set() won't allow setting a parent for an existing key", () => {
    map.set("one", { key: "one" });
    map.set("two", { key: "two" }, "one");
    map.set("three", { key: "three" }, "two");

    expect(
      () => map.set("one", { key: "four" }, "three")
    ).toThrowError("cannot set parent key for existing key: one");

    expect(
      () => map.set("two", { key: "four" }, "three")
    ).toThrowError("cannot set parent key for existing key: two");

    expect(
      () => map.set("two", { key: "four" }, "one")
    ).toThrowError("cannot set parent key for existing key: two");

    expect(Array.from(map.entries())).toEqual([
      ["one", { key: "one" }],
      ["two", { key: "two" }],
      ["three", { key: "three" }],
    ]);
  });

  it(".set() won't allow setting a key to its own parent", () => {
    expect(
      () => map.set("two", { key: "two"}, "two")
    ).toThrowError("parent key not established: two");
    expect(map.size).toBe(0);
  });

  it(".set() won't allow setting an unregistered parent key", () => {
    expect(
      () => map.set("two", { key: "two"}, "one")
    ).toThrowError("parent key not established: one");
    expect(map.size).toBe(0);
  });

  it(".delete() removes descendants", () => {
    map.set("one", { key: "one" });
    map.set("two", { key: "two" }, "one");
    map.set("three", { key: "three" }, "two");
    map.set("four", { key: "four" }, "three");
    map.set("five", { key: "five" }, "three");

    expect(map.delete("two")).toBeTrue();

    expect(Array.from(map)).toEqual([
      ["one", { key: "one" }],
    ]);

    expect(map.delete("two")).toBeFalse();
  });
});
