import { ReferenceSpecFileMap } from "./reference-spec/FileMap.js";
import { FileSystemController } from "./file-system/controller.js";
class Workbench_Base {
    /*
    readonly #fsSelector: HTMLSelectElement;
    */
    #fileMap;
    #refSpecFS;
    constructor() {
        /*
        this.#fsSelector = document.getElementById("workspace-selector") as HTMLSelectElement;
        */
        this.#fileMap = ReferenceSpecFileMap;
        window.onload = () => this.#initialize();
    }
    fileSelected(pathToFile) {
        console.log("fileSelected: pathToFile = " + pathToFile);
    }
    fileCheckToggled(pathToFile, isChecked) {
        console.log("fileCheckToggled: pathToFile = " + pathToFile + ", isChecked = " + isChecked);
    }
    #initialize() {
        this.#attachTestEvent();
    }
    #attachTestEvent() {
        document.getElementById("testButton").onclick = () => this.#doTestAction();
    }
    #doTestAction() {
        debugger;
        this.#refSpecFS = new FileSystemController("filesystem:reference-spec", this);
        this.#refSpecFS.setFileMap(ReferenceSpecFileMap);
    }
}
const Workbench = new Workbench_Base();
export { Workbench };
