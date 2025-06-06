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
        this.operationSelect.onchange = this.#updateElementsVisible.bind(this);
        this.displayElement.reset();
    }
    #getElement(id) {
        const elem = this.displayElement.elements.namedItem(id);
        if (elem instanceof HTMLInputElement) {
            const supportedOps = new Set((elem.dataset.supported?.split(",") ?? [ValidFileOperations["*"]]));
            for (const [op, innerMap] of this.#opToElementsMap.entries()) {
                innerMap.set(elem, supportedOps.has(op) || supportedOps.has(ValidFileOperations["*"]));
            }
        }
        return elem;
    }
    #updateElementsVisible(event) {
        event.stopPropagation();
        const { selectedOperation } = this;
        if (!selectedOperation) {
            this.submitButton.disabled = true;
            const array = [
                this.fileUploadPicker,
                this.uploadRoot,
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
    }
    get selectedOperation() {
        const value = this.operationSelect.value;
        if (value === "")
            return undefined;
        return value;
    }
}
