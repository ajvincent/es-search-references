import {
  TreeRowElement
} from "../elements/tree-row.js";

export abstract class TreeRowView {
  protected static buildEmptySpan(): HTMLSpanElement {
    return document.createElement("span");
  }

  public rowElement: TreeRowElement;
  #primaryLabel: string;
  #primaryLabelElement?: HTMLElement;

  public readonly depth: number;
  public readonly isCollapsible: boolean;
  public readonly abstract rowType: string;
  readonly #childRowViews: TreeRowView[] = [];

  constructor(depth: number, isCollapsible: boolean, primaryLabel: string) {
    this.depth = depth;
    this.isCollapsible = isCollapsible;
    this.#primaryLabel = primaryLabel;
    this.rowElement = new TreeRowElement(this.depth, this.isCollapsible);
  }

  protected abstract getCellElements(): HTMLElement[];

  public get primaryLabel(): string {
    return this.#primaryLabel;
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
    label.append(this.#primaryLabel);
    this.#primaryLabelElement = label;

    if (this.isCollapsible) {
      label.onclick = event => this.#handleLabelClick(event);
    }

    return label;
  }

  /**
   * Make the primary label editable.
   *
   * @param newLabelPromise - the new label to apply, or null to revert.
   * @returns the entered text, or null if the user canceled.
   */
  public editLabel(newLabelPromise: Promise<string | null>): Promise<string | null> {
    if (!this.#primaryLabelElement) {
      throw new Error("no label element");
    }

    newLabelPromise.then((label: string | null): void => {
      if (typeof label === "string") {
        this.#primaryLabel = this.#primaryLabelElement!.innerText = label;
      } else {
        this.#primaryLabelElement!.innerText = this.#primaryLabel;
      }
    });

    let { promise, resolve } = Promise.withResolvers<string | null>();

    promise = promise.finally(() => {
      this.#primaryLabelElement!.contentEditable = "false";
      this.#primaryLabelElement!.onkeyup = null;
      this.#primaryLabelElement!.onblur = null;
    });

    this.#primaryLabelElement.onkeyup = event => this.#handleLabelKey(resolve, event.key);
    this.#primaryLabelElement.onblur = event => this.#handleLabelKey(resolve, "Escape");
    this.#primaryLabelElement.contentEditable = "plaintext-only";
    this.#primaryLabelElement.focus();

    return promise;
  }

  #handleLabelKey(
    resolve: (value: string | null) => void,
    key: string
  ): void
  {
    if (key === "Escape") {
      resolve(null);
    }
    else if (key === "Enter") {
      resolve(this.#primaryLabelElement!.innerText.trim());
    }
  }

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

  #handleLabelClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleCollapsed();
  }
}
