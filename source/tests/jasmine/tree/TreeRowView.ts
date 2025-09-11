import {
  TreeRowView
} from "../../../scripts/tree/views/tree-row.js";

import {
  EnsureStyleRules
} from "../helpers/EnsureStyleRules.js";

import {
  getTempFieldset
} from "../helpers/TempFieldset.js";

import {
  hasPositiveArea
} from "../helpers/hasPositiveArea.js";

class FixtureRowView extends TreeRowView {
  static buildSpanCell(text: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.append(text);
    return span;
  }

  public readonly rowType = "FixtureRowView";
  readonly #primaryLabelElement: HTMLElement;

  constructor(depth: number, isCollapsible: boolean, primaryLabel: string) {
    super(depth, isCollapsible, primaryLabel);
    this.#primaryLabelElement = this.buildPrimaryLabelElement();
    this.addCells();
  }

  protected getCellElements(): HTMLElement[] {
    return [
      FixtureRowView.buildSpanCell("before"),
      this.#primaryLabelElement,
      FixtureRowView.buildSpanCell("after"),
    ];
  }

  public hasPositiveArea(): boolean {
    return hasPositiveArea(this.#primaryLabelElement);
  }
}

it("TreeRowView works", () => {
  const fieldset: HTMLFieldSetElement = getTempFieldset("TabPanelsView tests");
  let treeRows: HTMLElement;
  {
    const grid = document.createElement("tree-grid");
    grid.classList.add("tabpanelsviewtest");
    treeRows = document.createElement("tree-rows");

    grid.append(
      FixtureRowView.buildSpanCell("Left"),
      FixtureRowView.buildSpanCell("Primary"),
      FixtureRowView.buildSpanCell("Right"),
      treeRows
    );
    fieldset.append(grid);

    EnsureStyleRules(`
tree-grid.tabpanelsviewtest {
  grid-template-columns:
    [left] auto
    [primary] auto
    [right] auto
  ;
}

tree-grid.tabpanelsviewtest tree-row > :first-child {
  grid-column-start: left;
}
    `);
  }

  try {
    const aRow = new FixtureRowView(0, true, "a://");
    const bRow = new FixtureRowView(1, true, "b");
    const cRow = new FixtureRowView(2, false, "c.js");
    const dRow = new FixtureRowView(2, false, "d.js");
    const eRow = new FixtureRowView(1, false, "e.js");

    aRow.addRow(bRow);
    bRow.addRow(cRow);
    bRow.addRow(dRow);
    aRow.addRow(eRow);

    treeRows.append(aRow.rowElement);

    expect(aRow.isCollapsed).toBeFalse();
    expect(bRow.isCollapsed).toBeFalse();
    expect(cRow.isCollapsed).toBeFalse();
    expect(dRow.isCollapsed).toBeFalse();
    expect(eRow.isCollapsed).toBeFalse();

    expect(cRow.hasPositiveArea()).toBeTrue();

    bRow.toggleCollapsed();
    expect(aRow.isCollapsed).toBeFalse();
    expect(bRow.isCollapsed).toBeTrue();
    expect(cRow.isCollapsed).toBeFalse();
    expect(dRow.isCollapsed).toBeFalse();
    expect(eRow.isCollapsed).toBeFalse();
    expect(cRow.hasPositiveArea()).toBeFalse();

    aRow.toggleCollapsed();
    expect(aRow.isCollapsed).toBeTrue();
    expect(bRow.isCollapsed).toBeTrue();
    expect(cRow.isCollapsed).toBeFalse();
    expect(dRow.isCollapsed).toBeFalse();
    expect(eRow.isCollapsed).toBeFalse();
    expect(cRow.hasPositiveArea()).toBeFalse();

    bRow.toggleCollapsed();
    expect(aRow.isCollapsed).toBeTrue();
    expect(bRow.isCollapsed).toBeFalse();
    expect(cRow.isCollapsed).toBeFalse();
    expect(dRow.isCollapsed).toBeFalse();
    expect(eRow.isCollapsed).toBeFalse();
    expect(cRow.hasPositiveArea()).toBeFalse();

    aRow.toggleCollapsed();
    expect(aRow.isCollapsed).toBeFalse();
    expect(bRow.isCollapsed).toBeFalse();
    expect(cRow.isCollapsed).toBeFalse();
    expect(dRow.isCollapsed).toBeFalse();
    expect(eRow.isCollapsed).toBeFalse();
    expect(cRow.hasPositiveArea()).toBeTrue();
  }
  finally {
    fieldset.remove();
  }
});
