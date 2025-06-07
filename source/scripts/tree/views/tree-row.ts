import {
  TreeRowElement
} from "../elements/tree-row.js";

export abstract class TreeRowView {
  public rowElement?: TreeRowElement;

  public readonly depth: number;
  public readonly isCollapsible: boolean;
  public readonly primaryLabel: string;
  public readonly childRowViews: TreeRowView[] = [];

  constructor(depth: number, isCollapsible: boolean, primaryLabel: string) {
    this.depth = depth;
    this.isCollapsible = isCollapsible;
    this.primaryLabel = primaryLabel;
  }

  public initialize() {
    this.rowElement = new TreeRowElement(this.depth, this.isCollapsible, this.getCellElements());
  }

  public removeAndDispose(): void {
    this.rowElement?.remove();
    return this.#disposeAllViews();
  }

  #disposeAllViews(): void {
    this.rowElement = undefined;
    const collectedViews: TreeRowView[] = [this];
    for (const view of this.childRowViews) {
      view.#disposeAllViews();
    }
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
