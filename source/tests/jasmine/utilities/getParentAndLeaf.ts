import {
  getParentAndLeaf
} from "../../../scripts/utilities/getParentAndLeaf.js";

it("getParentAndLeaf is consistent", () => {
  expect(getParentAndLeaf("top/foo/bar.js")).withContext("top/foo/bar.js").toEqual(["top/foo", "bar.js"]);
  expect(getParentAndLeaf("top/foo")).withContext("top/foo").toEqual(["top", "foo"]);
  expect(getParentAndLeaf("top")).withContext("top").toEqual(["", "top"]);

  expect(getParentAndLeaf("virtual://top/foo/bar.js")).withContext("virtual://top/foo/bar.js").toEqual(["virtual://top/foo", "bar.js"]);
  expect(getParentAndLeaf("virtual://top/foo")).withContext("virtual://top/foo").toEqual(["virtual://top", "foo"]);
  expect(getParentAndLeaf("virtual://top")).withContext("virtual://top").toEqual(["virtual://", "top"]);
  expect(getParentAndLeaf("virtual://")).withContext("virtual://").toEqual(["", "virtual://"]);

  expect(getParentAndLeaf("virtual://top.js")).withContext("virtual://top.js").toEqual(["virtual://", "top.js"]);
});
