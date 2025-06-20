/** @deprecated */
export function getParentAndLeaf(key) {
    if (key.endsWith(":/")) {
        return ["", key + "/"];
    }
    let lastSlash = key.lastIndexOf("/");
    if (lastSlash === -1) {
        return ["", key];
    }
    const parent = key.substring(0, lastSlash);
    const leaf = key.substring(lastSlash + 1);
    return [parent, leaf];
}
