import { FileMap as ReferenceSpecFileMap } from "./reference-spec/FileMap.js";
class Workbench_Base {
    #fsSelector;
    #fileMap;
    constructor() {
        this.#fsSelector = document.getElementById("workspace-selector");
        this.#fileMap = ReferenceSpecFileMap;
        this.#attachEvents();
    }
    #attachEvents() {
        this.#fsSelector.onchange = () => this.#onWorkspaceSelect();
    }
    #onWorkspaceSelect() {
        const { value } = this.#fsSelector;
        if (value === "reference-spec") {
            this.#fileMap = ReferenceSpecFileMap;
        }
    }
}
const Workbench = new Workbench_Base();
export { Workbench };
