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
  readonly #panelsView: TabPanelsView;
  readonly #editorPanelViews = new Map<string, EditorPanelView>;

  public readonly panelSetId: string;
  public readonly displayElement: HTMLElement;

  constructor(
    fileMap: FileSystemMap,
    panelSetId: string,
    parentElement: HTMLElement
  )
  {
    this.#fileMap = fileMap;

    this.panelSetId = panelSetId;
    this.displayElement = document.createElement("tab-panels");
    this.displayElement.id = panelSetId;
    parentElement.append(this.displayElement);
    this.#panelsView = new TabPanelsView(panelSetId);


    for (const filePath of this.#fileMap.keys()) {
      const contents = this.#fileMap.get(filePath)!;
      this.addEditorForPath(filePath, contents);
    }
  }

  public addEditorForPath(filePath: string, contents: string): void {
    if (!this.displayElement) {
      throw new Error("no parent element for editor, call this.createEditors() first!");
    }

    if (this.#editorPanelViews.has(filePath)) {
      throw new Error("we already have an editor for " + filePath);
    }

    const editorPanelView = new EditorPanelView(filePath, contents);
    this.displayElement.append(editorPanelView.displayElement);
    this.#editorPanelViews.set(filePath, editorPanelView);
    this.#panelsView.addPanel(filePath, editorPanelView);
  }

  public selectFile(filePath: string) {
    this.#panelsView.activeViewKey = filePath;
  }

  public scrollToLine(lineNumber: number): void {
    const editorView: EditorPanelView = this.#editorPanelViews.get(this.#panelsView.activeViewKey)!;
    editorView.scrollToLine(lineNumber);
  }

  public updateFileMap(): void {
    this.#fileMap.batchUpdate(() => {
      const unvisited = new Set<string>(this.#fileMap.keys());
      for (const [key, editorView] of this.#editorPanelViews) {
        this.#fileMap.set(key, editorView.getContents());
        unvisited.delete(key);
      }

      for (const key of unvisited) {
        this.#fileMap.delete(key);
      }
    });
  }
}
