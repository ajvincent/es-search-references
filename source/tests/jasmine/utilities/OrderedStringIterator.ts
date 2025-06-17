import {
  OrderedStringIterator
} from "../../../scripts/utilities/OrderedStringIterator.js";

it("OrderedStringIterator iterates over strings in the right order", () => {
  const linkedList = new OrderedStringIterator(["b", "d", "n", "m", "p", "c"].toSorted());
  const iterator: ArrayIterator<string> = linkedList[Symbol.iterator]();

  expect(iterator.next()).toEqual({ value: "b", done: false });

  linkedList.itemDeleted("c");
  linkedList.itemDeleted("m");
  expect(iterator.next()).toEqual({ value: "d", done: false });

  // "b" was immediately after "a" in the array
  linkedList.itemAdded("a");
  // gracefully return the earliest unvisited value
  expect(iterator.next()).toEqual({ value: "a", done: false });

  linkedList.itemAdded("z");

  // picking up where we left off... m was deleted so we go to n
  expect(iterator.next()).toEqual({ value: "n", done: false });

  linkedList.itemAdded("j");
  linkedList.itemAdded("k");
  linkedList.itemAdded("h");

  // don't revisit keys we've already visited
  linkedList.itemDeleted("n");
  linkedList.itemAdded("n");

  expect(iterator.next()).toEqual({ value: "h", done: false });
  expect(iterator.next()).toEqual({ value: "j", done: false });
  expect(iterator.next()).toEqual({ value: "k", done: false });
  expect(iterator.next()).toEqual({ value: "p", done: false });
  expect(iterator.next()).toEqual({ value: "z", done: false });
  expect(iterator.next()).toEqual({ value: undefined, done: true });
});
