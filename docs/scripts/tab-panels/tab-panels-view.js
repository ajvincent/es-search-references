export class TabPanelsView {
    // CODEREVIEW: why is this still public?
    rootElement;
    #viewsMap = new Map;
    #activeViewKey;
    constructor(id) {
        this.rootElement = document.getElementById(id);
        if (!this.rootElement) {
            throw new Error("no root element with id: " + id);
        }
        this.#activeViewKey = "";
    }
    clearPanels() {
        this.rootElement.replaceChildren();
        this.#viewsMap.clear();
        this.#activeViewKey = "";
    }
    dispose() {
        this.clearPanels();
        this.rootElement.remove();
    }
    addPanel(hash, view) {
        if (hash === "") {
            throw new Error("The empty hash is reserved for 'show none'.");
        }
        if (this.#viewsMap.has(hash)) {
            this.removePanel(hash);
        }
        this.#viewsMap.set(hash, view);
        if (hash === this.#activeViewKey) {
            view.displayElement.classList.add("active");
        }
        else {
            view.displayElement.classList.remove("active");
        }
        this.rootElement.append(view.displayElement);
    }
    removePanel(hash) {
        const oldView = this.#viewsMap.get(hash);
        if (!oldView)
            throw new Error("what panel are you removing? id: " + hash);
        oldView.dispose();
        this.#viewsMap.delete(hash);
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
    entries() {
        return this.#viewsMap.entries();
    }
    get currentPanel() {
        return this.#viewsMap.get(this.#activeViewKey);
    }
    getPanel(key) {
        return this.#viewsMap.get(key);
    }
    hasPanel(key) {
        return this.#viewsMap.has(key);
    }
}
