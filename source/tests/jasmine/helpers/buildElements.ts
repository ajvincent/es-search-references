export function buildSpanCell(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.append(text);
  return span;
}
