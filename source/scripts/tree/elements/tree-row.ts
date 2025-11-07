export class TreeRowElement extends HTMLElement {
  constructor(depth: number, isCollapsible: boolean) {
    super();
    this.refreshDepthClass(depth);

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

  public refreshDepthClass(newDepth: number) {
    if (newDepth % 2 === 1) {
      this.classList.add("depth-odd");
      this.classList.remove("depth-even");
    } else {
      this.classList.remove("depth-odd");
      this.classList.add("depth-even");
    }
  }
}

window.customElements.define("tree-row", TreeRowElement);
