import "../../lib/packages/ctxmenu.js";
export class FileSystemContextMenu {
    static #CAPTURE_PASSIVE = Object.freeze({
        capture: true,
        passive: true
    });
    static #dividerItem = {
        isDivider: true
    };
    #controller;
    #fullPath;
    #menuDefinition;
    constructor(controller) {
        this.#controller = controller;
        this.#fullPath = undefined;
        this.#menuDefinition = [
            this.#headerItem,
            FileSystemContextMenu.#dividerItem,
            this.#addFileItem,
            this.#addDirectoryItem,
            FileSystemContextMenu.#dividerItem,
            this.#cutItem,
            this.#copyItem,
            this.#pasteItem,
            this.#renameItem,
            FileSystemContextMenu.#dividerItem,
            this.#deleteItem,
        ];
        const treeRows = this.#controller.getTreeRowsElement();
        treeRows.addEventListener("contextmenu", event => this.#showContextMenu(event));
        treeRows.addEventListener("click", event => this.#hideContextMenus(event), FileSystemContextMenu.#CAPTURE_PASSIVE);
    }
    #headerItem = {
        text: "Hello World",
    };
    #addFileItem = {
        text: "Add File",
        disabled: true,
        action(ev) {
            void (ev);
        },
    };
    #addDirectoryItem = {
        text: "Add Directory",
        disabled: true,
        action(ev) {
            void (ev);
        },
    };
    #cutItem = {
        text: "Cut",
        disabled: true,
        action(ev) {
            void (ev);
        },
    };
    #copyItem = {
        text: "Copy",
        action(ev) {
            void (ev);
        },
    };
    #pasteItem = {
        text: "Paste",
        disabled: true,
        action(ev) {
            void (ev);
        },
    };
    #deleteItem = {
        text: "Delete",
        disabled: true,
        action(ev) {
            void (ev);
        },
    };
    #renameItem = {
        text: "Rename",
        disabled: true,
        action(ev) {
            void (ev);
        },
    };
    #showContextMenu(event) {
        event.stopPropagation();
        let target = event.target;
        while (!target.dataset.fullpath) {
            target = target.parentElement;
        }
        this.#fullPath = target.dataset.fullpath;
        if (this.#fullPath.endsWith(":/"))
            this.#headerItem.text = this.#fullPath + "/";
        else
            this.#headerItem.text = this.#fullPath.replace(/^.*\//g, "");
        const { isReadOnly, clipBoardHasCopy } = this.#controller;
        const isDirectory = Boolean(target.dataset.isdirectory);
        this.#addDirectoryItem.disabled = isReadOnly || !isDirectory;
        this.#addFileItem.disabled = isReadOnly || !isDirectory;
        this.#cutItem.disabled = isReadOnly;
        this.#pasteItem.disabled = isReadOnly || !clipBoardHasCopy;
        this.#deleteItem.disabled = isReadOnly;
        this.#renameItem.disabled = isReadOnly;
        window.ctxmenu.show(this.#menuDefinition, event);
    }
    #hideContextMenus(event) {
        window.ctxmenu.hide();
        this.#fullPath = undefined;
    }
}
