import {
  BaseView
} from "./tab-panels-view.js";

export class GenericPanelView implements BaseView {
  readonly displayElement: HTMLElement;
  constructor(elementId: string) {
    this.displayElement = document.getElementById(elementId)!;
  }
}
