import * as CodeMirror from "../../lib/packages/CodeMirror.mjs";

{
  const source = `
/**
 * @param resultKey - an unique string key so searches can be distinguished from one another.
 * @param targetValue - the target we're searching for.
 * @param heldValues - the objects and symbols we presume are held strongly
 * @param strongReferencesOnly - true if we should ignore weak references.
 */
declare function searchReferences(
  this: void,
  resultsKey: string,
  targetValue: WeakKey,
  heldValues: readonly WeakKey[],
  strongReferencesOnly: boolean,
): void;
`.trim() + "\n";

  const view = new CodeMirror.EditorView({
    parent: document.getElementById("searchReferences-typescript"),
    doc: source,
    extensions: [
      CodeMirror.basicSetup,
      CodeMirror.javascript({
        typescript: true
      }),
      CodeMirror.EditorView.editable.of(false)
    ],
  });
  void(view);
}