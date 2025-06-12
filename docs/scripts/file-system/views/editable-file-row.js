import { FileRowView } from "./file-row.js";
export class EditableFileRowView extends FileRowView {
    #inputElement;
    get inputElement() {
        if (!this.#inputElement) {
            this.#inputElement = this.rowElement.querySelector(":scope > input");
        }
        return this.#inputElement;
    }
    constructor(depth, isCollapsible, primaryLabel) {
        super(depth, isCollapsible, primaryLabel, "*");
    }
    getCellElements() {
        const inputElement = document.createElement("input");
        inputElement.classList.add("indent");
        inputElement.type = "text";
        inputElement.size = 15;
        inputElement.value = this.primaryLabel;
        inputElement.style.backgroundColor = "transparent";
        inputElement.onclick = ev => ev.stopPropagation();
        return [
            EditableFileRowView.buildEmptySpan(),
            inputElement,
            EditableFileRowView.buildEmptySpan(),
        ];
    }
}
