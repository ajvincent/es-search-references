let styleElm: HTMLStyleElement;
function EnsureStylesheet() {
  if (styleElm) {
    return;
  }
  styleElm = document.createElement("style");
  document.body.prepend(styleElm);
}

const definedStyleRules = new Set<string>;
export function EnsureStyleRules(rules: string): void {
  EnsureStylesheet();
  rules = rules.trim() + "\n";
  if (!definedStyleRules.has(rules)) {
    styleElm.append(rules);
    styleElm.normalize();
    definedStyleRules.add(rules);
  }
}
