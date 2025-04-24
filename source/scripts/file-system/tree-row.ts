import {
  TreeRowElement
} from "../tree/views/tree-row.js";

export class FileTreeRow extends TreeRowElement {
  readonly #label: string;
  readonly #fullPath?: string;

  #labelElement: HTMLLabelElement | null = null;

  constructor(label: string, fullPath?: string) {
    super();
    this.#label = label;
    this.#fullPath = fullPath;
  }

  protected getCellElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];

    if (this.#fullPath) {
      elements.push(this.#buildCheckbox());
    } else {
      elements.push(new HTMLSpanElement);
    }

    elements.push(this.#buildLabelElement());

    if (this.#fullPath) {
      elements.push(this.#buildRadioElement());
    } else {
      elements.push(new HTMLSpanElement);
    }

    return elements;
  }

  #buildCheckbox(): HTMLInputElement {
    const checkbox = new HTMLInputElement;
    checkbox.type = "checkbox";
    checkbox.name = "filesSelected";
    checkbox.value = this.#fullPath!;
    return checkbox;
  }

  #buildLabelElement(): HTMLLabelElement {
    const label = new HTMLLabelElement();
    label.append(this.#label);
    this.#labelElement = label;
    return label;
  }

  #buildRadioElement(): HTMLInputElement {
    const radio = new HTMLInputElement();
    radio.type = "radio";
    radio.name = "currentRow";
    return radio;
  }

  get labelElement(): HTMLLabelElement | null {
    return this.#labelElement
  }
}
