import {
  DirectoryRowView
} from "../../../../scripts/file-system/views/directory-row.js";

import {
  FileRowView
} from "../../../../scripts/file-system/views/file-row.js";

import {
  FileSystemView
} from "../../../../scripts/file-system/views/file-system.js";

import type {
  DirectoryRecord
} from "../../../../scripts/opfs/types/WebFileSystemIfc.js";

import {
  getTempFieldset
} from "../../helpers/TempFieldset.js";

import {
  EnsureStyleRules
} from "../../helpers/EnsureStyleRules.js";

it("FileSystemView builds a view of an existing file system", () => {
  //#region test preamble
  const fieldset = getTempFieldset("File system view");
  const mockDirectoryRecord: DirectoryRecord = {
    "es-search-references": {
      "red": "const RED = { value: 'red' };\n export { RED };\n"
    },

    "one://": {
      two: {
        "three.js": "const THREE = { value: 3 };\nexport { THREE };\n",
        "four.js": "const FOUR = { value: 4 };\nexport { FOUR };\n",
      },
      five: {
        "six.js": "const SIX = { value: 6 };\nexport { SIX };\n",
      },
    },

    "seven://": {
      "eight.js": "const EIGHT = { value: 8 };\nexport { EIGHT };\n",
    }
  };

  function buildSpanCell(text: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.append(text);
    return span;
  }

  const form = document.createElement("form");

  const grid = document.createElement("tree-grid");
  grid.classList.add("filesystemview-test");
  const treeRows = document.createElement("tree-rows");
  grid.append(
    buildSpanCell("Search"),
    buildSpanCell("File"),
    buildSpanCell("Show"),
    treeRows
  );
  form.append(grid);

  EnsureStyleRules(`
tree-grid.filesystemview-test {
  grid-template-columns:
    [left] auto
    [primary] auto
    [right] auto
  ;
}


  try {
    const view = new FileSystemView(
      DirectoryRowView,
      FileRowView,
      false,
      treeRows,
      mockDirectories
    );
  }
  finally {
    fieldset.remove();
  }
  `);

  fieldset.append(form);
  //#endregion test preamble

  const view = new FileSystemView(DirectoryRowView, FileRowView, false, treeRows, mockDirectoryRecord);
  {
    expect(view.hasRowView("one://two/three.js")).toBeTrue();
    expect(view.hasRowView("one://two/zero.js")).toBeFalse();
    expect(view.hasRowView("one://two")).toBeTrue();
    expect(view.hasRowView("one://")).toBeTrue();

    const threeRow = view.getRowView("one://two/three.js");
    expect(threeRow).toBeInstanceOf(FileRowView);
    expect(threeRow.primaryLabel).toBe("three.js");

    const twoRow = view.getRowView("one://two");
    expect(twoRow).toBeInstanceOf(DirectoryRowView);
    expect(twoRow.primaryLabel).toBe("two");

    const oneRow = view.getRowView("one://");
    expect(oneRow).toBeInstanceOf(DirectoryRowView);
    expect(oneRow.primaryLabel).toBe("one://");

    const redRow = view.getRowView("es-search-references/red");
    expect(redRow).toBeInstanceOf(FileRowView);

    const foundFiles: [string, FileRowView][] = Array.from(view.descendantFileViews());
    expect(foundFiles[0][0]).toBe("es-search-references/red");
    expect(foundFiles[0][1]).toBe(redRow as FileRowView);

    expect(foundFiles.map(k => k[0])).toEqual([
      "es-search-references/red",
      "one://two/three.js",
      "one://two/four.js",
      "one://five/six.js",
      "seven://eight.js",
    ]);

    debugger;
    view.showFile("one://two/three.js");
    expect((threeRow as FileRowView).radioElement!.checked).toBeTrue();

    view.showFile("es-search-references/red");
    expect((redRow as FileRowView).radioElement!.checked).toBeTrue();
    expect((threeRow as FileRowView).radioElement!.checked).toBeFalse();
  }

  view.clearRowMap();
  expect(view.hasRowView("one://two/three.js")).toBeFalse();
  expect(view.hasRowView("one://two")).toBeFalse();
  expect(view.hasRowView("one://")).toBeFalse();
  expect(view.hasRowView("es-search-references/red")).toBeFalse();
  expect(Array.from(view.descendantFileViews())).toEqual([]);

  fieldset.remove();
}, 1000 * 60 * 60);
