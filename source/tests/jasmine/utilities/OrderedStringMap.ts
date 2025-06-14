import {
  OrderedStringMap
} from "../../../scripts/utilities/OrderedStringMap.js";

it("OrderedStringMap preserves the order of its keys", () => {
  const referenceValues: Record<string, symbol> = {
    "b": Symbol("b"),
    "d": Symbol("d"),
    "n": Symbol("n"),
    "m": Symbol("m"),
    "c": Symbol("c"),
  };
  let referenceEntries = Object.entries(referenceValues);
  const map = new OrderedStringMap<symbol>(referenceEntries);
  expect(referenceEntries[4][0]).withContext("referenceEntries was not altered").toBe("c");

  expect(map.get("b")).withContext("constructor initializing b key").toBe(referenceValues.b);
  referenceEntries.sort((a, b) => a[0].localeCompare(b[0]));

  function compareMap(contextPrefix: string): void {
    expect(Array.from(map)).withContext(contextPrefix + ":map").toEqual(referenceEntries);
    expect(Array.from(map.entries())).withContext(contextPrefix + ":entries").toEqual(referenceEntries);
    expect(Array.from(map.keys())).withContext(contextPrefix + ":keys").toEqual(referenceEntries.map(e => e[0]));
    expect(Array.from(map.values())).withContext(contextPrefix + ":values").toEqual(referenceEntries.map(e => e[1]));

    const newEntries: [string, symbol][] = [];
    map.forEach((value, key) => newEntries.push([key, value]));
    expect(newEntries).withContext(contextPrefix + ":forEach").toEqual(referenceEntries);
  }

  compareMap("initialized");

  {
    const eSymbol = Symbol("e");
    referenceEntries.push(["e", eSymbol]);
    referenceEntries.sort((a, b) => a[0].localeCompare(b[0]));
    map.set("e", eSymbol);
    compareMap("add e");
  }

  {
    referenceEntries.shift();
    map.delete("b");
    compareMap("delete b");
  }
});
