import { TreeRowElement } from "../../tree/views/tree-row.js";
export class FileTreeRow extends TreeRowElement {
    #label;
    #fullPath;
    #checkboxElement = null;
    #labelElement = null;
    #radioElement = null;
    constructor(label, fullPath) {
        super();
        this.#label = label;
        this.#fullPath = fullPath;
    }
    getCellElements() {
        const elements = [];
        if (this.#fullPath) {
            elements.push(this.#buildCheckbox());
        }
        else {
            elements.push(new HTMLSpanElement);
        }
        elements.push(this.#buildLabelElement());
        if (this.#fullPath) {
            elements.push(this.#buildRadioElement());
        }
        else {
            elements.push(new HTMLSpanElement);
        }
        return elements;
    }
    get checkboxElement() {
        return this.#checkboxElement;
    }
    get labelElement() {
        return this.#labelElement;
    }
    get radioElement() {
        return this.#radioElement;
    }
    #buildCheckbox() {
        const checkbox = new HTMLInputElement;
        checkbox.type = "checkbox";
        checkbox.name = "filesSelected";
        checkbox.value = this.#fullPath;
        this.#checkboxElement = checkbox;
        return checkbox;
    }
    #buildLabelElement() {
        const label = new HTMLLabelElement();
        label.append(this.#label);
        this.#labelElement = label;
        return label;
    }
    #buildRadioElement() {
        const radio = new HTMLInputElement();
        radio.type = "radio";
        radio.name = "currentRow";
        return radio;
    }
}
