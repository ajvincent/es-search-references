var _a;
import "../../lib/packages/ctxmenu.js";
export class FileSystemContextMenu {
    static #CAPTURE_PASSIVE = Object.freeze({
        capture: true,
        passive: true
    });
    static #dividerItem = {
        isDivider: true
    };
    static #createAddEntryItem(isProtocol, allowExtensions, callback) {
        const template = document.getElementById("addFile-contextsubmenu");
        const form = template.content.firstElementChild.cloneNode(true);
        if (isProtocol)
            form.classList.add("is-protocol");
        const newFilePath = form.newFilePath;
        if (allowExtensions) {
            newFilePath.pattern += newFilePath.dataset.extensionpattern;
        }
        delete newFilePath.dataset.extensionpattern;
        form.onsubmit = ev => {
            ev.stopPropagation();
            ev.preventDefault();
            callback(newFilePath.value);
        };
        return form;
    }
    #controller;
    #fullPath = "";
    #menuDefinition;
    constructor(controller) {
        this.#controller = controller;
        this.#fullPath = "";
        this.#menuDefinition = [
            this.#topLevelHeaderItem,
            _a.#dividerItem,
            this.#addPackageItem,
            this.#addProtocolItem,
            _a.#dividerItem,
            this.#localHeaderItem,
            _a.#dividerItem,
            this.#addDirectoryItem,
            this.#addFileItem,
            _a.#dividerItem,
            this.#cutItem,
            this.#copyItem,
            this.#pasteItem,
            this.#renameItem,
            _a.#dividerItem,
            this.#deleteItem,
        ];
        const treeRows = this.#controller.getTreeRowsElement();
        treeRows.addEventListener("click", event => this.#hideContextMenus(event), _a.#CAPTURE_PASSIVE);
    }
    #topLevelHeaderItem = {
        text: "FileSystem"
    };
    #addPackageItem = {
        text: "Add Package",
        disabled: true,
        subMenu: [
            {
                element: () => _a.#createAddEntryItem(false, false, this.#addPackage.bind(this)),
                disabled: true,
            }
        ],
        subMenuAttributes: {}
    };
    #addPackage(newPackageName) {
        window.ctxmenu.hide();
    }
    #addProtocolItem = {
        text: "Add Protocol",
        disabled: true,
        subMenu: [
            {
                element: () => _a.#createAddEntryItem(true, false, this.#addProtocol.bind(this)),
                disabled: true,
            }
        ],
        subMenuAttributes: {}
    };
    #addProtocol(newProtocolName) {
        window.ctxmenu.hide();
    }
    #localHeaderItem = {
        text: "",
    };
    #addDirectoryItem = {
        text: "Add Directory",
        disabled: true,
        subMenu: [
            {
                element: () => _a.#createAddEntryItem(false, true, this.#addDirectory.bind(this)),
                disabled: true,
            }
        ],
        subMenuAttributes: {},
    };
    #addDirectory(newFileName) {
        window.ctxmenu.hide();
    }
    #addFileItem = {
        text: "Add File",
        disabled: true,
        subMenu: [
            {
                element: () => _a.#createAddEntryItem(false, true, this.#addFile.bind(this)),
                disabled: true,
            }
        ],
        subMenuAttributes: {},
    };
    #addFile(newFileName) {
        window.ctxmenu.hide();
    }
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
        subMenu: [
            {
                element: () => {
                    const form = _a.#createAddEntryItem(false, true, this.#renameFile.bind(this));
                    form.submitButton.textContent = "Rename";
                    return form;
                },
                disabled: true,
            }
        ],
        subMenuAttributes: {},
    };
    #renameFile(newFileName) {
        window.ctxmenu.hide();
    }
    #contextMenuConfig = {
        onHide: () => this.#hideContextMenus(),
    };
    show(event, pathToFile, isDirectory) {
        this.#fullPath = pathToFile;
        if (this.#fullPath.endsWith("://"))
            this.#localHeaderItem.text = this.#fullPath;
        else
            this.#localHeaderItem.text = this.#fullPath.replace(/^.*\//g, "");
        const { isReadOnly, clipBoardHasCopy } = this.#controller;
        const isReservedName = pathToFile == "es-search-references" || pathToFile == "es-search-references/guest";
        this.#addPackageItem.disabled = isReadOnly;
        this.#addProtocolItem.disabled = isReadOnly;
        this.#addDirectoryItem.disabled = isReadOnly || !isDirectory;
        this.#addFileItem.disabled = isReadOnly || !isDirectory;
        this.#cutItem.disabled = isReadOnly || isReservedName;
        this.#pasteItem.disabled = isReadOnly || !isDirectory || !clipBoardHasCopy;
        this.#deleteItem.disabled = isReadOnly || isReservedName;
        this.#renameItem.disabled = isReadOnly || isReservedName;
        window.ctxmenu.show(this.#menuDefinition, event, this.#contextMenuConfig);
    }
    #hideContextMenus(event) {
        this.#fullPath = "";
    }
}
_a = FileSystemContextMenu;
