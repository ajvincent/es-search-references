import { FileSystemSetController, } from "../file-system/setController.js";
export class FileSystemSelectorView {
    static #controlsValue = "filesystem-controls";
    #selectElement;
    #fsSelectCallback;
    #fsControlsCallback;
    constructor(selectElement, fsSelectCallback, fsControlsCallback) {
        this.#selectElement = selectElement;
        this.#fsSelectCallback = fsSelectCallback;
        this.#fsControlsCallback = fsControlsCallback;
        this.#selectElement.onchange = this.#handleSelect.bind(this);
    }
    clearOptions() {
        const controlsOption = this.#selectElement.options.namedItem(FileSystemSelectorView.#controlsValue);
        this.#selectElement.replaceChildren(controlsOption);
    }
    async fillOptions(frontEnd) {
        const fileSystems = await frontEnd.getAvailableSystems();
        const options = [];
        let refSpecOption;
        for (const [systemKey, fileSystem] of Object.entries(fileSystems)) {
            const option = document.createElement("option");
            option.value = "fss:" + systemKey;
            option.append(fileSystem);
            if (fileSystem === FileSystemSetController.referenceFSLabel) {
                refSpecOption = option;
            }
            else {
                options.push(option);
            }
        }
        if (options.length) {
            options.sort((a, b) => a.text.localeCompare(b.text));
            this.#selectElement.append(...options);
        }
        this.#selectElement.prepend(refSpecOption);
    }
    #handleSelect(event) {
        event.preventDefault();
        event.stopPropagation();
        const { value } = this.#selectElement;
        if (value === "filesystem-controls") {
            this.#fsControlsCallback();
        }
        else {
            this.#fsSelectCallback(value.substring(4));
        }
    }
}
