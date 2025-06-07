import { FileSystemMap } from "../../storage/FileSystemMap.js";
export var ValidFileOperations;
(function (ValidFileOperations) {
    ValidFileOperations["clone"] = "clone";
    ValidFileOperations["upload"] = "upload";
    ValidFileOperations["rename"] = "rename";
    ValidFileOperations["export"] = "export";
    ValidFileOperations["delete"] = "delete";
    ValidFileOperations["*"] = "*";
})(ValidFileOperations || (ValidFileOperations = {}));
;
export class FileSystemSetView {
    static #createOption(value) {
        const option = document.createElement("option");
        option.value = value;
        option.append(value);
        return option;
    }
    static #referenceFileOption = FileSystemSetView.#createOption("reference-spec-filesystem");
    displayElement;
    operationSelect;
    fileUploadPicker;
    uploadRoot;
    sourceSelector;
    targetInput;
    submitButton;
    #opToElementsMap = new Map([
        [ValidFileOperations.clone, new Map],
        [ValidFileOperations.upload, new Map],
        [ValidFileOperations.rename, new Map],
        [ValidFileOperations.export, new Map],
        [ValidFileOperations.delete, new Map],
    ]);
    constructor() {
        this.displayElement = document.getElementById("filesystem-controls-form");
        this.operationSelect = this.#getElement("filesystem-operation");
        this.fileUploadPicker = this.#getElement("file-upload-picker");
        this.uploadRoot = this.#getElement("file-upload-root");
        this.sourceSelector = this.#getElement("file-system-source-selector");
        this.targetInput = this.#getElement("file-system-target");
        this.submitButton = this.#getElement("filesystem-submit");
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
    #handleOperationSelect(event) {
        event.stopPropagation();
        this.updateExistingSystemSelector();
        this.#updateElementsVisible();
    }
    updateExistingSystemSelector() {
        const currentSystems = FileSystemMap.allKeys();
        const options = currentSystems.map(FileSystemSetView.#createOption);
        if (this.operationSelect.value !== "rename" && this.operationSelect.value !== "delete") {
            options.unshift(FileSystemSetView.#referenceFileOption);
        }
        this.sourceSelector.replaceChildren(...options);
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
    #updateElementsVisible() {
        const { selectedOperation } = this;
        if (!selectedOperation) {
            this.submitButton.disabled = true;
            const array = [
                this.fileUploadPicker,
                this.uploadRoot,
                this.sourceSelector,
                this.targetInput,
            ];
            for (const elem of array) {
                this.#updateElemVisible(elem, false);
            }
            return;
        }
        const innerMap = this.#opToElementsMap.get(selectedOperation);
        for (const [elem, isSupported] of innerMap) {
            this.#updateElemVisible(elem, isSupported);
        }
        this.submitButton.disabled = false;
    }
    #updateElemVisible(elem, isSupported) {
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
    get selectedOperation() {
        const value = this.operationSelect.value;
        if (value === "")
            return undefined;
        return value;
    }
    #customValidateTarget(event) {
        const { value } = this.targetInput;
        if (value === "reference-spec-filesystem" || value === "File system controls") {
            this.targetInput.setCustomValidity("This file system name is reserved.");
        }
        else {
            this.targetInput.setCustomValidity("");
        }
    }
}
