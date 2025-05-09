export class TabPanelsView {
    #rootElement;
    #viewsMap = new Map;
    #activeViewKey;
    viewsMap = this.#viewsMap;
    constructor(id) {
        this.#rootElement = document.getElementById(id);
        this.#activeViewKey = "";
    }
    clearPanels() {
        this.#rootElement.replaceChildren();
        this.#viewsMap.clear();
        this.#activeViewKey = "";
    }
    addPanel(hash, view) {
        if (hash === "") {
            throw new Error("The empty hash is reserved for 'show none'.");
        }
        if (this.#viewsMap.has(hash)) {
            const oldView = this.#viewsMap.get(hash);
            oldView.displayElement.remove();
            this.#viewsMap.delete(hash);
        }
        this.#viewsMap.set(hash, view);
        if (hash === this.#activeViewKey) {
            view.displayElement.classList.add("active");
        }
        else {
            view.displayElement.classList.remove("active");
        }
        this.#rootElement.append(view.displayElement);
    }
    get activeViewKey() {
        return this.#activeViewKey;
    }
    set activeViewKey(newKey) {
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
