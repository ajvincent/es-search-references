import {
  BaseView
} from "./tab-panels-view.js";

export class GenericPanelView implements BaseView {
  readonly #mayDispose: boolean;
  readonly displayElement: HTMLElement;
  constructor(elementId: string, mayDispose: boolean) {
    this.displayElement = document.getElementById(elementId)!;
    this.#mayDispose = mayDispose;
  }

  dispose(): void {
    if (this.#mayDispose)
      this.displayElement.remove();
  }
}
