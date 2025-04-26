import {
  TreeRowView
} from "../../tree/views/tree-row.js";

export class FileRowView extends TreeRowView {
  private readonly fullPath: string;

  public checkboxElement: HTMLInputElement | null = null;
  public radioElement: HTMLInputElement | null = null;

  constructor(depth: number, label: string, fullPath: string) {
    super(depth, false, label);
    this.fullPath = fullPath;
    this.initialize();
  }

  protected getCellElements(): HTMLElement[] {
    return [
      this.buildCheckbox(),
      this.buildPrimaryLabelElement(),
      this.buildRadioElement(),
    ];
  }

  private buildCheckbox(): HTMLInputElement {
    const checkbox: HTMLInputElement = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "filesSelected";
    checkbox.value = this.fullPath!;
    this.checkboxElement = checkbox;
    return checkbox;
  }

  private buildRadioElement(): HTMLInputElement {
    const radio: HTMLInputElement = document.createElement("input");
    radio.type = "radio";
    radio.name = "currentRow";
    this.radioElement = radio;
    return radio;
  }
}
