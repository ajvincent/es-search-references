export class TreeRowElement extends HTMLElement {
  constructor(depth: number, isCollapsible: boolean) {
    super();
    if (depth % 2 === 1) {
      this.classList.add("depth-odd");
    } else if (depth > 0) {
      this.classList.add("depth-even");
    }

    if (isCollapsible) {
      this.classList.add("is-collapsible");
    }
  }

  public addCells(cells: HTMLElement[]): void {
    this.prepend(...cells);
  }

  public insertRow(newRow: TreeRowElement, referenceRow?: TreeRowElement) {
    if (referenceRow)
      referenceRow.before(newRow);
    else
      this.append(newRow);
  }

  public addRow(row: TreeRowElement): void {
    this.append(row);
  }

  public get isCollapsed(): boolean {
    return this.classList.contains("collapsed");
  }

  public toggleCollapsed(): void {
    this.classList.toggle("collapsed");
  }
}

window.customElements.define("tree-row", TreeRowElement);
