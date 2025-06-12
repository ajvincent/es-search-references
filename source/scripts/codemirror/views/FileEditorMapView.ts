import type {
  FileSystemMap
} from "../../storage/FileSystemMap.js";

import {
  type BaseView,
  TabPanelsView
} from "../../tab-panels/tab-panels-view.js";

import {
  EditorPanelView
} from "./EditorView.js";

export class FileEditorMapView implements BaseView {
  readonly #fileMap: FileSystemMap;
  readonly #panelsView: TabPanelsView<EditorPanelView>;

  public readonly panelSetId: string;
  public readonly displayElement: HTMLElement;
  readonly #isReadonly: boolean;

  constructor(
    fileMap: FileSystemMap,
    panelSetId: string,
    isReadonly: boolean,
    parentElement: HTMLElement
  )
  {
    this.#fileMap = fileMap;
    this.#isReadonly = isReadonly;

    this.panelSetId = panelSetId;
    this.displayElement = document.createElement("tab-panels");
    this.displayElement.id = panelSetId;
    parentElement.append(this.displayElement);
    this.#panelsView = new TabPanelsView(panelSetId);

    for (const filePath of this.#fileMap.keys()) {

      this.addEditorForPath(filePath);
    }
  }

  dispose(): void {
    this.displayElement.remove();
    this.#panelsView.dispose();
  }

  public addEditorForPath(filePath: string): void {
    if (!this.displayElement) {
      throw new Error("no parent element for editor, call this.createEditors() first!");
    }

    if (this.#panelsView.hasPanel(filePath)) {
      throw new Error("we already have an editor for " + filePath);
    }

    const contents = this.#fileMap.get(filePath);
    if (contents === undefined) {
      throw new Error("unknown file path: " + filePath);
    }

    const editorPanelView = new EditorPanelView(filePath, contents, this.#isReadonly);
    this.displayElement.append(editorPanelView.displayElement);
    this.#panelsView.addPanel(filePath, editorPanelView);
  }

  public selectFile(filePath: string) {
    this.#panelsView.activeViewKey = filePath;
  }

  public scrollToLine(lineNumber: number): void {
    this.#panelsView.currentPanel!.scrollToLine(lineNumber);
  }

  public updateFileMap(): void {
    this.#fileMap.batchUpdate(() => {
      const unvisited = new Set<string>(this.#fileMap.keys());
      for (const [key, editorView] of this.#panelsView.entries()) {
        this.#fileMap.set(key, editorView.getContents());
        unvisited.delete(key);
      }

      for (const key of unvisited) {
        this.#fileMap.delete(key);
      }
    });
  }
}
