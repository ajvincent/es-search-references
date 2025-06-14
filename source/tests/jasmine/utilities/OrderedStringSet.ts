import {
  OrderedStringSet
} from "../../../scripts/utilities/OrderedStringSet.js";

it("OrderedStringSet indeed preserves the order of its elements", () => {
  const originalArray = ["b", "d", "n", "m", "c"];
  const ordered = new OrderedStringSet(originalArray);
  expect(originalArray).withContext("set has its own elements array").toEqual(["b", "d", "n", "m", "c"]);
  expect(Array.from(ordered)).withContext("set initializes to a sorted order").toEqual(["b", "c", "d", "m", "n"]);

  expect(ordered.has("c")).withContext("has(c)").toBeTrue();
  expect(ordered.has("e")).withContext("has(e) before add").toBeFalse();

  ordered.add("c");
  expect(Array.from(ordered)).withContext("adding existing item").toEqual(
    ["b", "c", "d", "m", "n"]
  );
  expect(ordered.size).withContext("bcdmn").toBe(5);

  ordered.add("e");
  expect(Array.from(ordered)).withContext("adding item in the middle").toEqual(
    ["b", "c", "d", "e", "m", "n"]
  );
  expect(ordered.has("e")).withContext("has(e) after add").toBeTrue();
  expect(ordered.size).withContext("bcdemn").toBe(6);

  ordered.add("a");
  expect(Array.from(ordered)).withContext("adding item to the head").toEqual(
    ["a", "b", "c", "d", "e", "m", "n"]
  );
  expect(ordered.size).withContext("abcdemn").toBe(7);

  ordered.add("z");
  expect(Array.from(ordered)).withContext("adding item to the tail").toEqual(
    ["a", "b", "c", "d", "e", "m", "n", "z"]
  );
  expect(ordered.size).withContext("abcdemnz").toBe(8);

  expect(ordered.delete("f")).toBeFalse();
  expect(Array.from(ordered)).withContext("delete(f)").toEqual(
    ["a", "b", "c", "d", "e", "m", "n", "z"]
  );

  expect(ordered.delete("e")).toBeTrue();
  expect(Array.from(ordered)).withContext("delete(f)").toEqual(
    ["a", "b", "c", "d", "m", "n", "z"]
  );
  expect(ordered.has("e")).withContext("has(e) after delete").toBeFalse();
  expect(ordered.size).withContext("abcdmnz").toBe(7);

  ordered.clear();
  expect(ordered.size).withContext("size after clear").toBe(0);
  expect(Array.from(ordered)).withContext("empty array after clear").toEqual([]);
});
