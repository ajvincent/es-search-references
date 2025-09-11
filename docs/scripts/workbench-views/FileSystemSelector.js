import { FileSystemSetController, } from "../file-system/setController.js";
export class FileSystemSelectorView {
    static #controlsValue = "filesystem-controls";
    #selectElement;
    #fsSelectCallback;
    #fsControlsCallback;
    #optionsMap = new Map;
    constructor(selectElement, fsSelectCallback, fsControlsCallback) {
        this.#selectElement = selectElement;
        this.#fsSelectCallback = fsSelectCallback;
        this.#fsControlsCallback = fsControlsCallback;
        this.#selectElement.onchange = this.#handleSelect.bind(this);
    }
    get currentValue() {
        return this.#selectElement.value;
    }
    selectOption(key) {
        this.#selectElement.value = "fss:" + key;
        this.#fsSelectCallback(key);
    }
    clearOptions() {
        const controlsOption = this.#selectElement.options.namedItem(FileSystemSelectorView.#controlsValue);
        this.#selectElement.replaceChildren(controlsOption);
        this.#optionsMap.clear();
    }
    async fillOptions(frontEnd) {
        const fileSystems = await frontEnd.getAvailableSystems();
        const options = [];
        let refSpecOption;
        const systemIterator = Object.entries(fileSystems);
        for (const [systemKey, fileSystemDescriptor] of systemIterator) {
            const option = document.createElement("option");
            option.value = "fss:" + systemKey;
            option.append(fileSystemDescriptor);
            this.#optionsMap.set(fileSystemDescriptor, option);
            if (fileSystemDescriptor === FileSystemSetController.referenceFSLabel) {
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
    hasOptionByDescription(description) {
        return this.#optionsMap.has(description);
    }
    hideOptionByDescription(description) {
        const option = this.#optionsMap.get(description);
        if (option) {
            option.remove();
            this.#optionsMap.delete(description);
        }
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
