import { runSearchesInGuestEngine, } from "../lib/packages/runSearchesInGuestEngine.js";
document.getElementById("testButton").onclick = function (evt) {
    const p = document.createElement("p");
    p.append("typeof runSearchesInGuestEngine: " + typeof runSearchesInGuestEngine);
    evt.target.after(p);
};
