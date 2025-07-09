let hasAddedStylesheet = false;

function buildFieldsetStylesheet() {
  if (hasAddedStylesheet) {
    return;
  }
  hasAddedStylesheet = true;
  const styleElm = document.createElement("style");
  styleElm.append(`
fieldset {
  border-color: red;
  border-radius: 15px;
  font-family: Verdana;
  max-width: 400px;
}

fieldset > legend {
  color: red;
}
  `.trim() + "\n");

  document.body.prepend(styleElm);
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
