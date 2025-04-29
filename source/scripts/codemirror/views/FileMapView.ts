import {
  type BaseView,
  TabPanelsView
} from "../../tab-panels/tab-panels-view.js";

import {
  EditorPanelView
} from "./EditorView.js";

export class FileMapView implements BaseView {
  readonly #fileMap: Map<string, string>;
  readonly #panelsView: TabPanelsView;
  readonly #editorPanelViews = new Map<string, EditorPanelView>;

  public readonly panelSetId: string;
  public readonly displayElement: HTMLElement;

  constructor(fileMap: Map<string, string>, panelSetId: string) {
    this.#fileMap = fileMap;

    this.panelSetId = panelSetId;
    this.displayElement = document.createElement("tab-panels");
    this.displayElement.id = panelSetId;
    document.getElementById("codemirror-panels")!.append(this.displayElement);
    this.#panelsView = new TabPanelsView(panelSetId);

    const keys = Array.from(this.#fileMap.keys());
    keys.sort();
    for (const filePath of keys) {
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

  public updateFileMap(): void {
    const unvisited = new Set<string>(this.#fileMap.keys());
    for (const [key, editorView] of this.#editorPanelViews) {
      this.#fileMap.set(key, editorView.getContents());
      unvisited.delete(key);
    }

    for (const key of unvisited) {
      this.#fileMap.delete(key);
    }
  }
}
