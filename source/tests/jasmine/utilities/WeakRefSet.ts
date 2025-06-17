import {
  WeakRefSet
} from "../../../scripts/utilities/WeakRefSet.js";

it("WeakRefSet can hold references to values it knows about", () => {
  function addValue(): object {
    const value = {};
    refSet.addReference(value);
    return value;
  }

  const refSet = new WeakRefSet;

  expect(refSet.hasReference({})).toBe(false);

  const value = addValue();
  expect(refSet.hasReference(value)).toBe(true);

  expect(refSet.deleteReference(value)).toBe(true);
  expect(refSet.deleteReference(value)).toBe(false);

  addValue(); // unreachable - we're not testing the size of elements.

  refSet.addReference(value);
  const secondValue = addValue();

  let elements = new Set<object>(refSet.liveElements());
  expect(elements.has(value)).toBe(true);
  expect(elements.has(secondValue)).toBe(true);

  refSet.clearReferences();
  elements = new Set<object>(refSet.liveElements());
  expect(elements.size).toBe(0);
});
