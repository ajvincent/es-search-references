import { TreeRowView } from "../../tree/views/tree-row.js";
export class FileRowView extends TreeRowView {
    fullPath;
    checkboxElement = null;
    radioElement = null;
    constructor(depth, label, fullPath) {
        super(depth, false, label);
        this.fullPath = fullPath;
        this.initialize();
    }
    getCellElements() {
        return [
            this.buildCheckbox(),
            this.buildPrimaryLabelElement(),
            this.buildRadioElement(),
        ];
    }
    buildCheckbox() {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "filesSelected";
        checkbox.value = this.fullPath;
        this.checkboxElement = checkbox;
        return checkbox;
    }
    buildRadioElement() {
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "currentRow";
        this.radioElement = radio;
        return radio;
    }
}
