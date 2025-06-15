export function getParentAndLeaf(key) {
    return URL.canParse(key) ? getURLParentAndLeaf(key) : getPackageParentAndLeaf(key);
}
function getURLParentAndLeaf(key) {
    const url = URL.parse(key);
    if (url.pathname) {
        return getPackageParentAndLeaf(key);
    }
    if (url.host) {
        const parent = key.substring(0, key.length - url.host.length);
        return [parent, url.host];
    }
    return ["", key];
}
function getPackageParentAndLeaf(key) {
    let lastSlash = key.lastIndexOf("/");
    if (lastSlash === -1) {
        return ["", key];
    }
    const parent = key.substring(0, lastSlash);
    const leaf = key.substring(lastSlash + 1);
    return [parent, leaf];
}
