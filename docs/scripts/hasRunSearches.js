import { runSearchesInGuestEngine, LoggingConfiguration, } from "../lib/packages/runSearchesInGuestEngine.js";
import { WebGuestRealmInputs } from "./model/WebGuestRealmInputs.js";
const sampleScript = `
import "es-search-references/guest";
const objectTarget = { isTarget: true };
const differentTargetName = objectTarget;
const isFirstValue = { isFirstValue: true };
const symbolTarget = Symbol("is symbol target");
const heldValues = [
    isFirstValue,
    differentTargetName,
    symbolTarget,
];
searchReferences("target object in held values", objectTarget, heldValues, true);
searchReferences("target symbol in held values", symbolTarget, heldValues, true);
//# sourceMappingURL=targetInHeldValuesArray.js.map
`.trim() + "\n";
document.getElementById("testButton").onclick = async function (evt) {
    const inputs = new WebGuestRealmInputs("virtual://main.js", new Map([
        ["virtual://main.js", sampleScript]
    ]));
    const config = new LoggingConfiguration;
    const search = await runSearchesInGuestEngine(inputs, config);
    const pre = document.createElement("pre");
    pre.append(config.retrieveLogs("virtual://main.js", "target object in held values")?.join("\n") ?? "(no value found)");
    evt.target.after(pre);
};
