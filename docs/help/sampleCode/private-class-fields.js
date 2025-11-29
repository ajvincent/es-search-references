import * as CodeMirror from "../../lib/packages/CodeMirror.mjs";

{
  const source = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
class Vehicle {
    #owner;
    constructor(owner) {
        this.#owner = owner;
        void (this.#owner);
    }
}
const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);
searchReferences("class private fields", Fred, [hisBike], true);
`.trim() + "\n";

  const view = new CodeMirror.EditorView({
    parent: document.getElementById("privateClassFields-sample"),
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
