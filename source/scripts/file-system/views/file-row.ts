import {
  BaseFileRowView
} from "./base-file-row.js";

export class FileRowView extends BaseFileRowView {

  constructor(depth: number, isCollapsible: boolean, label: string, fullPath: string) {
    super(depth, isCollapsible, label, fullPath);
  }

  protected getCellElements(): HTMLElement[] {
    return [
      this.buildCheckbox(),
      this.buildPrimaryLabelElement(),
      this.buildRadioElement(),
    ];
  }

  public get checkboxElement(): HTMLInputElement | null {
    return this.rowElement!.querySelector(`:scope > input[type="checkbox"]`);
  }
  public get radioElement(): HTMLInputElement | null {
    return this.rowElement!.querySelector(`:scope > input[type="radio"]`);
  }

  private buildCheckbox(): HTMLInputElement {
    const checkbox: HTMLInputElement = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "filesSelected";
    checkbox.value = this.fullPath!;
    return checkbox;
  }

  private buildRadioElement(): HTMLInputElement {
    const radio: HTMLInputElement = document.createElement("input");
    radio.type = "radio";
    radio.name = "currentRow";
    return radio;
  }

  public selectFile(
    key: string
  ): void
  {
    this.radioElement!.click();
  }
}
