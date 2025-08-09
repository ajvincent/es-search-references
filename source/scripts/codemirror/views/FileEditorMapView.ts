import { OPFSWebFileSystemIfc } from "scripts/opfs/types/WebFileSystemIfc.js";
import {
  type BaseView,
  TabPanelsView
} from "../../tab-panels/tab-panels-view.js";

import {
  EditorPanelView
} from "./EditorView.js";

export class FileEditorMapView implements BaseView {
  readonly #panelsView: TabPanelsView<EditorPanelView>;
  readonly #webFS: OPFSWebFileSystemIfc;

  public readonly displayElement: HTMLElement;
  readonly #isReadonly: boolean;

  constructor(
    panelSetId: string,
    isReadonly: boolean,
    parentElement: HTMLElement,

    webFS: OPFSWebFileSystemIfc
  )
  {
    this.#isReadonly = isReadonly;

    this.displayElement = document.createElement("tab-panels");
    this.displayElement.id = panelSetId;
    parentElement.append(this.displayElement);
    this.#panelsView = new TabPanelsView(panelSetId);

    this.#webFS = webFS;
  }

  dispose(): void {
    this.displayElement.remove();
    this.#panelsView.dispose();
  }

  public hasEditorForPath(filePath: string): boolean {
    return this.#panelsView.hasPanel(filePath);
  }

  public async addEditorForPath(filePath: string): Promise<void> {
    if (this.#panelsView.hasPanel(filePath)) {
      throw new Error("we already have an editor for " + filePath);
    }

    const contents = await this.#webFS.readFileDeep(filePath);
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

  /*
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
  */
}
