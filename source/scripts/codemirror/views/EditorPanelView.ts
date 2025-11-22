import {
  type BaseView,
} from "../../tab-panels/tab-panels-view.js";

import {
  CodeMirrorElement
} from "../elements/editor.js";

export class EditorPanelView implements BaseView {
  readonly displayElement: CodeMirrorElement;
  constructor(pathToFile: string, contents: string, isReadonly: boolean) {
    this.displayElement = new CodeMirrorElement(pathToFile, contents, isReadonly);
  }

  dispose(): void {
    this.displayElement.remove();
  }

  getContents(): string {
    return this.displayElement.getContents();
  }

  scrollToLine(lineNumber: number): void {
    this.displayElement.scrollToLine(lineNumber);
  }

  setDocChangedCallback(
    callback: (this: void) => void
  ): void
  {
    this.displayElement.setDocChangedCallback(callback);
  }
}
