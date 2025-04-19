import { Agent } from "../lib/packages/engine262.mjs";

document.getElementById("testButton").onclick = function(evt) {
  const p = document.createElement("p");
  p.append("typeof Agent: " + typeof Agent);
  evt.target.after(p);
}
