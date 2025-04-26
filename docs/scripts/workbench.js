import { ReferenceSpecFileMap } from "./reference-spec/FileMap.js";
import { FileSystemController, } from "./file-system/controller.js";
import { TabPanelsView } from "./other/tab-panels-view.js";
class Workbench_Base {
    /*
    readonly #fsSelector: HTMLSelectElement;
    */
    #fileMap;
    #refSpecFS;
    #outputLogsView;
    #codeMirrorView;
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
        this.#refSpecFS = new FileSystemController("filesystem:reference-spec", true, this);
        this.#refSpecFS.setFileMap(ReferenceSpecFileMap);
        this.#outputLogsView = new TabPanelsView("output-logs");
        this.#codeMirrorView = new TabPanelsView("codemirror-panels");
        this.#attachTestEvent();
    }
    #attachTestEvent() {
        document.getElementById("testButton").onclick = () => this.#doTestAction();
    }
    #doTestAction() {
        /*
        const panel = document.createElement("output-panel");
        const date = new Date();
        panel.append(`This is child number ${
          document.getElementById("output-logs")!.children.length
        }, created at ${date.toISOString()}.`);
        const key = "foo-" + date.toISOString();
        this.#outputLogsView!.addPanel(key, {displayElement: panel});
        this.#outputLogsView!.activeViewKey = key;
        */
    }
}
const Workbench = new Workbench_Base();
export { Workbench };
