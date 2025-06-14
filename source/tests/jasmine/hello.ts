import { TWO } from "./helpers/two.js";

it("Hello World", () => {
  expect(1).withContext("1 < 2").toBeLessThan(TWO);
});
