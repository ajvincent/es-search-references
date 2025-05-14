export interface BaseView {
  readonly displayElement: HTMLElement;
  handleActivated?: () => void;
}

export class TabPanelsView {
  readonly rootElement: HTMLElement;
  readonly #viewsMap = new Map<string, BaseView>;
  #activeViewKey: string;

  readonly viewsMap: ReadonlyMap<string, BaseView> = this.#viewsMap;

  constructor(id: string)
  {
    this.rootElement = document.getElementById(id)!;
    this.#activeViewKey = "";
  }

  clearPanels(): void {
    this.rootElement.replaceChildren();
    this.#viewsMap.clear();
    this.#activeViewKey = "";
  }

  addPanel(hash: string, view: BaseView): void {
    if (hash === "") {
      throw new Error("The empty hash is reserved for 'show none'.");
    }

    if (this.#viewsMap.has(hash)) {
      const oldView = this.#viewsMap.get(hash)!;
      oldView.displayElement.remove();
      this.#viewsMap.delete(hash);
    }

    this.#viewsMap.set(hash, view);
    if (hash === this.#activeViewKey) {
      view.displayElement.classList.add("active");
    } else {
      view.displayElement.classList.remove("active");
    }

    this.rootElement.append(view.displayElement);
  }

  get activeViewKey(): string {
    return this.#activeViewKey;
  }

  set activeViewKey(newKey: string) {
    const oldView = this.#viewsMap.get(this.#activeViewKey);
    if (oldView)
      oldView.displayElement.classList.remove("active");

    const newView = this.#viewsMap.get(newKey);
    if (newView) {
      newView.displayElement.classList.add("active");
      if (newView.handleActivated)
        newView.handleActivated();
    }

    this.#activeViewKey = newKey;
  }
}
