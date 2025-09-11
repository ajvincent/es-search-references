import {
  TabPanelsView
} from "../../../scripts/tab-panels/tab-panels-view.js";

import {
  GenericPanelView
} from "../../../scripts/tab-panels/panelView.js";

import {
  getTempFieldset
} from "../helpers/TempFieldset.js";

import {
  hasPositiveArea
} from "../helpers/hasPositiveArea.js";

it("TabPanelsView shows one panel at a time", () => {
  const fieldset: HTMLFieldSetElement = getTempFieldset("TabPanelsView tests");

  function buildGenericView(id: string): GenericPanelView {
    const div = document.createElement("div");
    div.id = "tabpanelsview:panel:" + id;
    div.append("panel id: " + id);
    fieldset.append(div);
    return new GenericPanelView(div.id, true);
  }

  function viewHasPositiveArea(view: GenericPanelView): boolean {
    return hasPositiveArea(view.displayElement);
  }

  try {
    let panelsView: TabPanelsView;
    {
      const rootElement = document.createElement("tab-panels");
      rootElement.id = "tabpanelsview:root";
      fieldset.append(rootElement);
      panelsView = new TabPanelsView(rootElement.id);
    }

    const firstPanel = buildGenericView("one");
    panelsView.addPanel("one", firstPanel);
    expect(viewHasPositiveArea(firstPanel)).toBeFalse();

    panelsView.activeViewKey = "one";
    expect(panelsView.activeViewKey).toBe("one");
    expect(viewHasPositiveArea(firstPanel)).toBeTrue();

    const secondPanel = buildGenericView("two");
    panelsView.addPanel("two", secondPanel);
    expect(viewHasPositiveArea(firstPanel)).toBeTrue();
    expect(viewHasPositiveArea(secondPanel)).toBeFalse();

    panelsView.activeViewKey = "two";
    expect(panelsView.activeViewKey).toBe("two");
    expect(viewHasPositiveArea(firstPanel)).toBeFalse();
    expect(viewHasPositiveArea(secondPanel)).toBeTrue();

    const thirdPanel = buildGenericView("three");
    panelsView.addPanel("two", thirdPanel);
    expect(secondPanel.displayElement.parentNode).toBeNull();
    expect(viewHasPositiveArea(firstPanel)).toBeFalse();
    expect(viewHasPositiveArea(thirdPanel)).toBeTrue();

    expect(panelsView.currentPanel).toBe(thirdPanel);
    expect(panelsView.hasPanel("one")).toBeTrue();
    expect(panelsView.hasPanel("two")).toBeTrue();
    expect(panelsView.hasPanel("four")).toBeFalse();
    expect(panelsView.getPanel("one")).toBe(firstPanel);
    expect(panelsView.getPanel("two")).toBe(thirdPanel);

    expect(Array.from(panelsView.entries())).toEqual([
      ["one", firstPanel],
      ["two", thirdPanel]
    ]);

    panelsView.addPanel("four", secondPanel);
    panelsView.removePanel("four");
    expect(panelsView.hasPanel("four")).toBeFalse();

    panelsView.activeViewKey = "";
    expect(panelsView.activeViewKey).toBe("");
    expect(viewHasPositiveArea(firstPanel)).toBeFalse();
    expect(viewHasPositiveArea(thirdPanel)).toBeFalse();

    panelsView.dispose();
    expect(panelsView.rootElement.parentNode).toBeNull();
    expect(Array.from(panelsView.entries())).toEqual([]);
  }
  finally {
    fieldset.remove();
  }
});
