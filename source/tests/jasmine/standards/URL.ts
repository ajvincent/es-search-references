it("Standards tests: URL, virtual://top/foo/bar.js", () => {
  const href = "virtual://top/foo/bar.js";
  expect(URL.canParse(href)).toBeTrue();

  const url = URL.parse(href)!;
  expect(url.protocol).toBe("virtual:")
  expect(url.pathname).toBe("/foo/bar.js");
  expect(url.host).toBe("top");
});
