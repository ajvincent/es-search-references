export function buildCustomStylesheet(
  root: HTMLElement,
): CSSStyleSheet
{
  const elem = document.createElement("style");
  const comment = document.createComment(
    "This stylesheet exists to hold dynamically created style rules.  " +
    "That's why this is empty."
  );
  elem.appendChild(comment);

  root.appendChild(elem);
  return elem.sheet!;
}
