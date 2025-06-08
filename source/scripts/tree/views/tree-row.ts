import {
  TreeRowElement
} from "../elements/tree-row.js";

export abstract class TreeRowView {
  public rowElement: TreeRowElement;

  public readonly depth: number;
  public readonly isCollapsible: boolean;
  public readonly primaryLabel: string;
  public readonly childRowViews: TreeRowView[] = [];

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
    for (const view of this.childRowViews) {
      view.#disposeAllViews();
    }
    this.childRowViews.splice(0, this.childRowViews.length);
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
