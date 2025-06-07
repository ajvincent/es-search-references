export interface BaseView {
  readonly displayElement: HTMLElement;
  handleActivated?: () => void;

  dispose(): void;
}

export class TabPanelsView<PanelView extends BaseView = BaseView> {
  readonly rootElement: HTMLElement;
  readonly #viewsMap = new Map<string, PanelView>;
  #activeViewKey: string;

  constructor(id: string)
  {
    this.rootElement = document.getElementById(id)!;
    if (!this.rootElement) {
      throw new Error("no root element with id: " + id);
    }
    this.#activeViewKey = "";
  }

  clearPanels(): void {
    this.rootElement.replaceChildren();
    this.#viewsMap.clear();
    this.#activeViewKey = "";
  }

  dispose(): void {
    this.clearPanels();
    this.rootElement.remove();
  }

  addPanel(hash: string, view: PanelView): void {
    if (hash === "") {
      throw new Error("The empty hash is reserved for 'show none'.");
    }

    if (this.#viewsMap.has(hash)) {
      this.removePanel(hash);
    }

    this.#viewsMap.set(hash, view);
    if (hash === this.#activeViewKey) {
      view.displayElement.classList.add("active");
    } else {
      view.displayElement.classList.remove("active");
    }

    this.rootElement.append(view.displayElement);
  }

  removePanel(hash: string): void {
    const oldView = this.#viewsMap.get(hash);
    if (!oldView)
      throw new Error("what panel are you removing? id: " + hash);
    oldView.dispose();
    this.#viewsMap.delete(hash);
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

  entries(): IterableIterator<[string, PanelView]> {
    return this.#viewsMap.entries();
  }

  get currentPanel(): PanelView | undefined {
    return this.#viewsMap.get(this.#activeViewKey);
  }

  getPanel(key: string): PanelView | undefined {
    return this.#viewsMap.get(key);
  }

  hasPanel(key: string): boolean {
    return this.#viewsMap.has(key);
  }
}
