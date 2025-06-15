export function getParentAndLeaf(key: string): readonly [string, string] {
  return URL.canParse(key) ? getURLParentAndLeaf(key) : getPackageParentAndLeaf(key);
}

function getURLParentAndLeaf(key: string): readonly [string, string] {
  const url: URL = URL.parse(key)!;
  if (url.pathname) {
    return getPackageParentAndLeaf(key);
  }

  if (url.host) {
    const parent = key.substring(0, key.length - url.host.length);
    return [parent, url.host];
  }

  return ["", key];
}

function getPackageParentAndLeaf(key: string): readonly [string, string] {
  let lastSlash = key.lastIndexOf("/");
  if (lastSlash === -1) {
    return ["", key];
  }
  const parent = key.substring(0, lastSlash);
  const leaf = key.substring(lastSlash + 1);
  return [parent, leaf];
}
