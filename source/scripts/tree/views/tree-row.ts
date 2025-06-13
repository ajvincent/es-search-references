import {
  TreeRowElement
} from "../elements/tree-row.js";

export abstract class TreeRowView {
  protected static buildEmptySpan(): HTMLSpanElement {
    return document.createElement("span");
  }

  public rowElement: TreeRowElement;

  public readonly depth: number;
  public readonly isCollapsible: boolean;
  public readonly primaryLabel: string;
  public readonly abstract rowType: string;
  readonly #childRowViews: TreeRowView[] = [];

  constructor(depth: number, isCollapsible: boolean, primaryLabel: string) {
    this.depth = depth;
    this.isCollapsible = isCollapsible;
    this.primaryLabel = primaryLabel;
    this.rowElement = new TreeRowElement(this.depth, this.isCollapsible);
  }

  protected addCells() {
    this.rowElement.addCells(this.getCellElements());
  }

  public removeAndDispose(): void {
    this.rowElement.remove();
    return this.#disposeAllViews();
  }

  #disposeAllViews(): void {
    this.rowElement.remove();
    for (const view of this.#childRowViews) {
      view.#disposeAllViews();
    }
    this.#childRowViews.splice(0, this.#childRowViews.length);
  }

  protected buildPrimaryLabelElement(): HTMLLabelElement {
    const label = document.createElement("label");
    label.classList.add("indent");
    label.append(this.primaryLabel);
    return label;
  }

  protected abstract getCellElements(): HTMLElement[];

  public prependRow(rowView: TreeRowView): void {
    this.rowElement!.insertRow(rowView.rowElement!, this.#childRowViews[0]?.rowElement);
    this.#childRowViews.unshift(rowView);
  }

  public insertRowSorted(rowView: TreeRowView): void {
    let referenceRow: TreeRowView | undefined;
    const newLabel: string = rowView.primaryLabel;
    let index = 0;

    let lastChildRow = this.#childRowViews.at(-1);
    if (!lastChildRow || lastChildRow.primaryLabel.localeCompare(newLabel) < 0) {
      this.addRow(rowView);
      return;
    }

    // binary search would probably not be faster in this case: not enough rows to justify it
    for (const existingRow of this.#childRowViews) {
      if (existingRow.primaryLabel.localeCompare(newLabel) <= 0) {
        index++;
        continue;
      }
      referenceRow = existingRow;
      break;
    }

    this.#childRowViews.splice(index, 0, rowView);
    this.rowElement!.insertRow(rowView.rowElement!, referenceRow?.rowElement);
  }

  public removeRow(rowView: TreeRowView): void {
    const index = this.#childRowViews.indexOf(rowView);
    if (index === -1)
      throw new Error("row not found");
    this.#childRowViews.splice(index, 1);
    rowView.removeAndDispose();
  }

  public addRow(rowView: TreeRowView): void {
    this.rowElement!.addRow(rowView.rowElement!);
    this.#childRowViews.push(rowView);
  }

  public get isCollapsed(): boolean {
    return this.rowElement!.isCollapsed;
  }

  public toggleCollapsed(): void {
    this.rowElement!.toggleCollapsed();
  }
}
