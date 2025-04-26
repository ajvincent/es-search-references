import { TreeRowElement } from "../elements/tree-row.js";

export abstract class TreeRowView {
  public rowElement?: TreeRowElement;
  protected readonly RowConstructor = TreeRowElement;

  public readonly depth: number;
  public readonly isCollapsible: boolean;
  public readonly primaryLabel: string;
  public readonly childRowViews: TreeRowView[] = [];

  constructor(depth: number, isCollapisble: boolean, primaryLabel: string) {
    this.depth = depth;
    this.isCollapsible = isCollapisble;
    this.primaryLabel = primaryLabel;
  }

  public initialize() {
    this.rowElement = new this.RowConstructor(this.depth, this.isCollapsible, this.getCellElements());
  }

  public removeAndDispose(): TreeRowView[] {
    this.rowElement?.remove();
    return this.#disposeAllViews();
  }

  #disposeAllViews(): TreeRowView[] {
    this.rowElement = undefined;
    const collectedViews: TreeRowView[] = [this];
    for (const view of this.childRowViews) {
      collectedViews.push(...view.#disposeAllViews());
    }
    return collectedViews;
  }

  protected buildPrimaryLabelElement(): HTMLLabelElement {
    const label = document.createElement("label");
    label.classList.add("indent");
    label.append(this.primaryLabel);
    return label;
  }

  protected abstract getCellElements(): HTMLElement[];

  public addRow(rowView: TreeRowView) {
    this.rowElement!.addRow(rowView.rowElement!);
    this.childRowViews.push(rowView);
  }

  public get isCollapsed(): boolean {
    return this.rowElement!.isCollapsed;
  }

  public toggleCollapsed(): void {
    this.rowElement!.toggleCollapsed();
  }
}
