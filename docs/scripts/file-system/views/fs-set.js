var _a;
import { FileSystemSelectorView } from "../../workbench-views/FileSystemSelector.js";
export var ValidFileOperations;
(function (ValidFileOperations) {
    ValidFileOperations["build"] = "build";
    ValidFileOperations["clone"] = "clone";
    ValidFileOperations["upload"] = "upload";
    ValidFileOperations["rename"] = "rename";
    ValidFileOperations["export"] = "export";
    ValidFileOperations["delete"] = "delete";
    ValidFileOperations["*"] = "*";
})(ValidFileOperations || (ValidFileOperations = {}));
;
export class FileSystemSetView {
    // copied from FileSystemSetController
    static #referenceFSLabel = "Reference-spec file system";
    static #controlsLabel = "File system controls";
    static #updateElementVisible(elem, isSupported) {
        if (isSupported) {
            elem.classList.remove("hidden");
            elem.previousElementSibling.classList.remove("hidden");
            elem.disabled = false;
            elem.required = true;
        }
        else {
            elem.classList.add("hidden");
            elem.previousElementSibling.classList.add("hidden");
            elem.disabled = true;
            elem.required = false;
        }
        if (elem instanceof HTMLInputElement) {
            elem.value = "";
        }
        else {
            elem.selectedIndex = -1;
        }
    }
    #fsFrontEnd;
    #sourceSelectorView;
    displayElement;
    operationSelect;
    fileUploadPicker;
    sourceSelector;
    targetInput;
    submitButton;
    #opToElementsMap = new Map([
        [ValidFileOperations.build, new Map],
        [ValidFileOperations.clone, new Map],
        [ValidFileOperations.upload, new Map],
        [ValidFileOperations.rename, new Map],
        [ValidFileOperations.export, new Map],
        [ValidFileOperations.delete, new Map],
    ]);
    constructor(fsFrontEnd) {
        this.#fsFrontEnd = fsFrontEnd;
        this.displayElement = document.getElementById("filesystem-controls-form");
        this.operationSelect = this.#getElement("filesystem-operation");
        this.fileUploadPicker = this.#getElement("file-upload-picker");
        this.sourceSelector = this.#getElement("file-system-source-selector");
        this.targetInput = this.#getElement("file-system-target");
        this.submitButton = this.#getElement("filesystem-submit");
        this.#sourceSelectorView = new FileSystemSelectorView(this.sourceSelector, (uuid) => {
        }, () => null);
        this.operationSelect.onchange = this.#handleOperationSelect.bind(this);
        this.targetInput.onchange = this.#customValidateTarget.bind(this);
    }
    dispose() {
        throw new Error("not implemented, this is a singleton");
    }
    handleActivated() {
        this.updateExistingSystemSelector();
    }
    ;
    async #handleOperationSelect(event) {
        event.stopPropagation();
        await this.updateExistingSystemSelector();
        this.#updateAllElementsVisible();
        this.submitButton.disabled = false;
    }
    async updateExistingSystemSelector() {
        this.#sourceSelectorView.clearOptions();
        await this.#sourceSelectorView.fillOptions(this.#fsFrontEnd);
        if (this.operationSelect.value === "rename" || this.operationSelect.value === "delete") {
            this.#sourceSelectorView.hideOptionByDescription(_a.#referenceFSLabel);
        }
    }
    #getElement(id) {
        const elem = this.displayElement.elements.namedItem(id);
        if (elem instanceof HTMLButtonElement)
            return elem;
        if (elem.dataset.supported) {
            const supportedOps = new Set((elem.dataset.supported?.split(",") ?? [ValidFileOperations["*"]]));
            for (const [op, innerMap] of this.#opToElementsMap.entries()) {
                innerMap.set(elem, supportedOps.has(op) || supportedOps.has(ValidFileOperations["*"]));
            }
        }
        return elem;
    }
    #updateAllElementsVisible() {
        const { selectedOperation } = this;
        if (!selectedOperation) {
            this.submitButton.disabled = true;
            const array = [
                this.fileUploadPicker,
                this.sourceSelector,
                this.targetInput,
            ];
            for (const elem of array) {
                _a.#updateElementVisible(elem, false);
            }
            return;
        }
        const innerMap = this.#opToElementsMap.get(selectedOperation);
        for (const [elem, isSupported] of innerMap) {
            _a.#updateElementVisible(elem, isSupported);
        }
        this.submitButton.disabled = false;
    }
    get selectedOperation() {
        const value = this.operationSelect.value;
        if (value === "")
            return undefined;
        return value;
    }
    #customValidateTarget(event) {
        const { value } = this.targetInput;
        if (value === _a.#referenceFSLabel || value === _a.#controlsLabel) {
            this.targetInput.setCustomValidity("This file system name is reserved.");
        }
        else if (this.#sourceSelectorView.hasOptionByDescription(value)) {
            this.targetInput.setCustomValidity("This file system description is in use.");
        }
        else {
            this.targetInput.setCustomValidity("");
        }
    }
}
_a = FileSystemSetView;
