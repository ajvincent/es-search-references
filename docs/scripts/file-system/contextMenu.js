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
    static #createAddEntryItem(isProtocol, allowExtensions, submitCallback, nameChangeCallback) {
        const template = document.getElementById("addFile-contextsubmenu");
        const form = template.content.firstElementChild.cloneNode(true);
        if (isProtocol)
            form.classList.add("is-protocol");
        const newFilePath = form.newFilePath;
        if (allowExtensions) {
            newFilePath.pattern += newFilePath.dataset.extensionpattern;
        }
        delete newFilePath.dataset.extensionpattern;
        newFilePath.onchange = ev => {
            ev.stopPropagation();
            newFilePath.setCustomValidity(nameChangeCallback(newFilePath.value));
        };
        form.onsubmit = ev => {
            ev.stopPropagation();
            ev.preventDefault();
            submitCallback(newFilePath.value);
        };
        return form;
    }
    #controller;
    #menuDefinition;
    #showArguments;
    constructor(controller) {
        this.#controller = controller;
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
    #siblingNameInUse(localName) {
        if (this.#showArguments.pathIsProtocol)
            localName += "://";
        if (this.#showArguments.currentSiblings.has(localName))
            return "This name is in use.";
        return "";
    }
    #childNameInUse(localName) {
        if (this.#showArguments.currentChildren.has(localName))
            return "This name is in use.";
        return "";
    }
    #topLevelHeaderItem = {
        text: "FileSystem"
    };
    #addPackageItem = {
        text: "Add Package",
        disabled: true,
        subMenu: [
            {
                element: () => _a.#createAddEntryItem(false, false, this.#addPackage.bind(this), this.#packageNameInUse.bind(this)),
                disabled: true,
            }
        ],
        subMenuAttributes: {}
    };
    #addPackage(newPackageName) {
        window.ctxmenu.hide();
    }
    #packageNameInUse(packageName) {
        if (this.#showArguments.currentPackages.has(packageName))
            return "This package name is in use.";
        return "";
    }
    #addProtocolItem = {
        text: "Add Protocol",
        disabled: true,
        subMenu: [
            {
                element: () => _a.#createAddEntryItem(true, false, this.#addProtocol.bind(this), this.#protocolNameInUse.bind(this)),
                disabled: true,
            }
        ],
        subMenuAttributes: {}
    };
    #addProtocol(newProtocolName) {
        window.ctxmenu.hide();
    }
    #protocolNameInUse(newProtocolName) {
        if (this.#showArguments.currentProtocols.has(newProtocolName + "://")) {
            return "This protocol name is in use.";
        }
        return "";
    }
    #localHeaderItem = {
        text: "",
    };
    #addDirectoryItem = {
        text: "Add Directory",
        disabled: true,
        subMenu: [
            {
                element: () => _a.#createAddEntryItem(false, true, this.#addDirectory.bind(this), this.#childNameInUse.bind(this)),
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
                element: () => _a.#createAddEntryItem(false, true, this.#addFile.bind(this), this.#childNameInUse.bind(this)),
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
                    const form = _a.#createAddEntryItem(this.#showArguments.pathIsProtocol, true, this.#renameFile.bind(this), this.#siblingNameInUse.bind(this));
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
    show(showArgs) {
        this.#showArguments = showArgs;
        this.#localHeaderItem.text = showArgs.leafName;
        const { isReservedName, isDirectory } = showArgs;
        const { isReadOnly, clipBoardHasCopy } = this.#controller;
        this.#addPackageItem.disabled = isReadOnly;
        this.#addProtocolItem.disabled = isReadOnly;
        this.#addDirectoryItem.disabled = isReadOnly || !isDirectory;
        this.#addFileItem.disabled = isReadOnly || !isDirectory;
        this.#cutItem.disabled = isReadOnly || isReservedName;
        this.#pasteItem.disabled = isReadOnly || !isDirectory || !clipBoardHasCopy;
        this.#deleteItem.disabled = isReadOnly || isReservedName;
        this.#renameItem.disabled = isReadOnly || isReservedName;
        window.ctxmenu.show(this.#menuDefinition, showArgs.event, this.#contextMenuConfig);
    }
    #hideContextMenus(event) {
        // do nothing (for now)
    }
}
_a = FileSystemContextMenu;
