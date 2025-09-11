import type {
  OPFSWebFileSystemIfc
} from "../../opfs/types/WebFileSystemIfc.js";

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

  public async updateSelectedFile(): Promise<void> {
    const currentPanel: EditorPanelView | undefined = this.#panelsView.currentPanel;
    if (!currentPanel)
      return;
    const pathToFile: string = this.#panelsView.activeViewKey!;
    const fileContents: string = currentPanel.getContents();

    await this.#webFS.writeFileDeep(pathToFile, fileContents);
  }
}
