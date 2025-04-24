import {
  FileMap as ReferenceSpecFileMap
} from "./reference-spec/FileMap.js";

class Workbench_Base {
  readonly #fsSelector: HTMLSelectElement;

  #fileMap: ReadonlyMap<string, string>;

  constructor() {
    this.#fsSelector = document.getElementById("workspace-selector") as HTMLSelectElement;
    this.#fileMap = ReferenceSpecFileMap;

    this.#attachEvents();
  }

  #attachEvents() {
    this.#fsSelector.onchange = () => this.#onWorkspaceSelect();
  }

  #onWorkspaceSelect(): void {
    const { value } = this.#fsSelector;
    if (value === "reference-spec") {
      this.#fileMap = ReferenceSpecFileMap;
    }
  }
}

const Workbench = new Workbench_Base();
export { Workbench };
