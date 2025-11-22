import type {
  OPFSWebFileSystemIfc
} from "../../opfs/types/WebFileSystemIfc.js";

import {
  type BaseView,
  TabPanelsView
} from "../../tab-panels/tab-panels-view.js";

import {
  EditorPanelView
} from "./EditorPanelView.js";

export class FileEditorMapView implements BaseView {
  readonly #panelsView: TabPanelsView<EditorPanelView>;
  readonly #webFS: OPFSWebFileSystemIfc;

  public readonly displayElement: HTMLElement;
  readonly #isReadonly: boolean;
  readonly #fileModifiedCallback?: (this: void, pathToFile: string) => void;

  constructor(
    panelSetId: string,
    isReadonly: boolean,
    parentElement: HTMLElement,

    webFS: OPFSWebFileSystemIfc,
    fileModifiedCallback: ((this: void, pathToFile: string) => void) | undefined,
  )
  {
    this.#isReadonly = isReadonly;

    this.displayElement = document.createElement("tab-panels");
    this.displayElement.id = panelSetId;
    parentElement.append(this.displayElement);
    this.#panelsView = new TabPanelsView(panelSetId);

    this.#webFS = webFS;
    this.#fileModifiedCallback = fileModifiedCallback;
  }

  dispose(): void {
    this.displayElement.remove();
    this.#panelsView.dispose();
  }

  public hasEditorForPath(filePath: string): boolean {
    return this.#panelsView.hasPanel(filePath);
  }

  public async addEditorForPath(
    filePath: string,
    forceReadonly: boolean
  ): Promise<void>
  {
    if (this.#panelsView.hasPanel(filePath)) {
      throw new Error("we already have an editor for " + filePath);
    }

    let contents: string;
    if (filePath.startsWith("(clipboard)/"))
      contents = await this.#webFS.readClipboardFile(filePath.substring(12));
    else
      contents = await this.#webFS.readFileDeep(filePath);
    if (contents === undefined) {
      throw new Error("unknown file path: " + filePath);
    }

    const editorPanelView = new EditorPanelView(
      filePath, contents, this.#isReadonly || forceReadonly
    );
    if (this.#fileModifiedCallback) {
      editorPanelView.setDocChangedCallback(() => this.#fileModifiedCallback!(filePath));
    }
    this.displayElement.append(editorPanelView.displayElement);
    this.#panelsView.addPanel(filePath, editorPanelView);
  }

  public getContentsFromEditor(
    filePath: string
  ): string | undefined
  {
    return this.#panelsView.getPanel(filePath)?.getContents();
  }

  public selectFile(filePath: string) {
    this.#panelsView.activeViewKey = filePath;
  }

  public scrollToLine(lineNumber: number): void {
    this.#panelsView.currentPanel!.scrollToLine(lineNumber);
  }

  public clearPanels(): void {
    this.#panelsView.clearPanels();
  }
}
