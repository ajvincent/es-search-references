import { BaseFileRowView } from "./base-file-row.js";
export class FileRowView extends BaseFileRowView {
    getCellElements() {
        return [
            this.buildCheckbox(),
            this.buildPrimaryLabelElement(),
            this.buildRadioElement(),
        ];
    }
    get checkboxElement() {
        return this.rowElement.querySelector(`:scope > input[type="checkbox"]`);
    }
    get radioElement() {
        return this.rowElement.querySelector(`:scope > input[type="radio"]`);
    }
    buildCheckbox() {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "filesSelected";
        checkbox.value = this.fullPath;
        return checkbox;
    }
    buildRadioElement() {
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "currentRow";
        return radio;
    }
    selectFile(key) {
        this.radioElement.click();
    }
}
