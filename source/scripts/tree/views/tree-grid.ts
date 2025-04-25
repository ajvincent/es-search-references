import type {
  Class
} from "type-fest";

import type {
  TreeRowElement
} from "./tree-row.js";

export class TreeGridElement<
  RowElement extends TreeRowElement,
  Arguments extends unknown[]
> extends HTMLElement
{
  readonly #rowMap = new Map<string, [depth: number, row: RowElement]>;
  readonly #RowBuilder: Class<RowElement, Arguments>;

  constructor(
    RowBuilder: Class<RowElement, Arguments>,
    rootArguments: Arguments,
    headerRow?: DocumentFragment
  )
  {
    super();
    this.#RowBuilder = RowBuilder;

    const rootRow = new this.#RowBuilder(...rootArguments);
    this.#rowMap.set("", [0, rootRow]);
    this.append(rootRow);
    if (headerRow)
      rootRow.before(headerRow);
  }

  getRow(key: string): RowElement | undefined {
    const depthAndRow = this.#rowMap.get(key);
    if (depthAndRow)
      return depthAndRow[1];
    return undefined;
  }

  public addRow(
    parentKey: string,
    childKey: string,
    rowArguments: Arguments
  ): RowElement
  {
    if (this.#rowMap.has(childKey))
      throw new Error("child key is not unique");
    const parentRowAndDepth = this.#rowMap.get(parentKey);
    if (!parentRowAndDepth)
      throw new Error("no parent row found!");

    const newRow = new this.#RowBuilder(...rowArguments);
    const [parentDepth, parentRow] = parentRowAndDepth;

    const depth = parentDepth + 1;
    if (depth % 2 === 0) {
      newRow.classList.add("depth-even");
    }
    else {
      newRow.classList.add("depth-odd");
    }

    this.#rowMap.set(childKey, [depth, newRow]);
    parentRow.addRow(newRow);
    return newRow;
  }

  public removeRow(key: string): void {
    if (key === "")
      throw new Error("You cannot remove the root!");
    const existingRowAndDepth = this.#rowMap.get(key);
    if (!existingRowAndDepth)
      throw new Error("No row found for key " + key);

    existingRowAndDepth[1].remove();
    this.#rowMap.delete(key);
  }

  public clearRows(): void {
    this.lastElementChild?.replaceChildren();
    this.#rowMap.clear();
  }
}

window.customElements.define("tree-grid", TreeGridElement);
