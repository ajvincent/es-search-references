//#region preamble
import {
  FileSystemMap
} from "../../../../scripts/file-system/FileSystemMap.js";

import {
  DirectoryRowView
} from "../../../../scripts/file-system/views/directory-row.js";

import {
  FileRowView
} from "../../../../scripts/file-system/views/file-row.js";

import {
  FileSystemView
} from "../../../../scripts/file-system/views/file-system.js";

import {
  mockDirectoryRecord
} from "../../fixtures/mockDirectories.js";

import {
  getTempFieldset
} from "../../helpers/TempFieldset.js";

import {
  EnsureStyleRules
} from "../../helpers/EnsureStyleRules.js";

import {
  buildSpanCell
} from "../../helpers/buildElements.js";
//#endregion preamble

describe("FileSystemView builds a view of an existing file system", () => {
  let fieldset: HTMLFieldSetElement;
  let treeRows: HTMLElement;
  let view: FileSystemView<DirectoryRowView, FileRowView>;
  beforeAll(() => {
    fieldset = getTempFieldset("File system view");

    const form = document.createElement("form");

    const grid = document.createElement("tree-grid");
    grid.classList.add("filesystemview-test");
    treeRows = document.createElement("tree-rows");
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
    `);

    fieldset.append(form);
  });

  afterAll(() => {
    fieldset.remove();
  });

  afterEach(() => {
    view.clearRowMap();
    treeRows.replaceChildren();
  });

  it("without filters for matching files", () => {
    const map = new FileSystemMap<DirectoryRowView | FileRowView>(0);
    view = new FileSystemView(
      DirectoryRowView, FileRowView, false, treeRows, mockDirectoryRecord, map
    );

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
      "one://five/six.js",
      "one://two/four.js",
      "one://two/three.js",
      "seven://eight.js",
    ]);

    view.showFile("one://two/three.js");
    expect((threeRow as FileRowView).radioElement!.checked).toBeTrue();

    view.showFile("es-search-references/red");
    expect((redRow as FileRowView).radioElement!.checked).toBeTrue();
    expect((threeRow as FileRowView).radioElement!.checked).toBeFalse();
  });

  it("with a filter for matching files", () => {
    const map = new FileSystemMap<DirectoryRowView | FileRowView>(0);
    view = new FileSystemView(
      DirectoryRowView, FileRowView, false, treeRows, mockDirectoryRecord, map,
      (fullPath: string) => fullPath.startsWith("one://two/")
    );

    expect(view.hasRowView("one://")).toBeTrue();
    expect(view.hasRowView("one://two")).toBeTrue();
    expect(view.hasRowView("one://two/three.js")).toBeTrue();
    expect(view.hasRowView("one://two/four.js")).toBeTrue();
    expect(view.hasRowView("one://five")).toBeFalse();
    expect(view.hasRowView("es-search-references")).toBeFalse();
    expect(Array.from(view.descendantFileViews()).length).toBe(2);
  });

  it("reports false after clearing all rows", () => {
    const map = new FileSystemMap<DirectoryRowView | FileRowView>(0);
    view = new FileSystemView(
      DirectoryRowView, FileRowView, false, treeRows, mockDirectoryRecord, map
    );

    view.clearRowMap();
    expect(view.hasRowView("one://two/three.js")).toBeFalse();
    expect(view.hasRowView("one://two")).toBeFalse();
    expect(view.hasRowView("one://")).toBeFalse();
    expect(view.hasRowView("es-search-references/red")).toBeFalse();
    expect(Array.from(view.descendantFileViews())).toEqual([]);
  });
});
