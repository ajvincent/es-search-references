import {
  EnsureStyleRules
} from "./EnsureStyleRules.js";

function buildFieldsetStylesheet() {
  EnsureStyleRules(`
fieldset {
  border-color: red;
  border-radius: 15px;
  font-family: Verdana;
  max-width: 400px;
}

fieldset > legend {
  color: red;
}
  `);
}

export function getTempFieldset(
  legendContents: string
): HTMLFieldSetElement
{
  const fieldset = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.append(legendContents);
  fieldset.append(legend);
  document.body.append(fieldset);
  buildFieldsetStylesheet();
  return fieldset;
}
