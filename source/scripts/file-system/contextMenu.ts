import "../../lib/packages/ctxmenu.js";

import type {
  CTXConfig,
  CTXMAction,
  CTXMDivider,
  CTXMenu,
  CTXMHeading,
  CTXMSubMenu,
} from "../../lib/packages/ctxmenu.js";

import type {
  FSControllerCallbacksIfc
} from "./types/FSControllerCallbacksIfc.js";

export class FileSystemContextMenu {
  static readonly #CAPTURE_PASSIVE = Object.freeze({
    capture: true,
    passive: true
  });

  static #dividerItem: CTXMDivider = {
    isDivider: true
  };

  static #createAddEntryItem(
    isProtocol: boolean,
    allowExtensions: boolean,
    callback: (newFilePath: string) => void
  ): HTMLFormElement
  {
    const template: HTMLTemplateElement = document.getElementById("addFile-contextsubmenu") as HTMLTemplateElement;
    const form: HTMLFormElement = template.content.firstElementChild!.cloneNode(true) as HTMLFormElement;
    if (isProtocol)
      form.classList.add("is-protocol");

    const newFilePath = form.newFilePath as HTMLInputElement;
    if (allowExtensions) {
      newFilePath.pattern += newFilePath.dataset.extensionpattern;
    }
    delete newFilePath.dataset.extensionpattern;

    form.onsubmit = ev => {
      ev.stopPropagation();
      ev.preventDefault();
      callback(newFilePath.value);
    }
    return form;
  }

  readonly #controller: FSControllerCallbacksIfc;
  #fullPath = "";
  readonly #menuDefinition: CTXMenu;

  constructor(controller: FSControllerCallbacksIfc) {
    this.#controller = controller;
    this.#fullPath = "";

    this.#menuDefinition = [
      this.#topLevelHeaderItem,
      FileSystemContextMenu.#dividerItem,
      this.#addPackageItem,
      this.#addProtocolItem,
      FileSystemContextMenu.#dividerItem,
      this.#localHeaderItem,
      FileSystemContextMenu.#dividerItem,
      this.#addDirectoryItem,
      this.#addFileItem,
      FileSystemContextMenu.#dividerItem,
      this.#cutItem,
      this.#copyItem,
      this.#pasteItem,
      this.#renameItem,
      FileSystemContextMenu.#dividerItem,
      this.#deleteItem,
    ];

    const treeRows: HTMLElement = this.#controller.getTreeRowsElement();
    treeRows.addEventListener(
      "click",
      event => this.#hideContextMenus(event),
      FileSystemContextMenu.#CAPTURE_PASSIVE
    );
  }

  readonly #topLevelHeaderItem: CTXMHeading = {
    text: "FileSystem"
  };

  readonly #addPackageItem: CTXMSubMenu = {
    text: "Add Package",
    disabled: true,
    subMenu: [
      {
        element: () => FileSystemContextMenu.#createAddEntryItem(false, false, this.#addPackage.bind(this)),
        disabled: true,
      }
    ],
    subMenuAttributes: {

    }
  };

  #addPackage(newPackageName: string): void {
    window.ctxmenu.hide();
  }

  readonly #addProtocolItem: CTXMSubMenu = {
    text: "Add Protocol",
    disabled: true,
    subMenu: [
      {
        element: () => FileSystemContextMenu.#createAddEntryItem(true, false, this.#addProtocol.bind(this)),
        disabled: true,
      }
    ],
    subMenuAttributes: {

    }
  };

  #addProtocol(newProtocolName: string): void {
    window.ctxmenu.hide();
  }

  readonly #localHeaderItem: CTXMHeading = {
    text: "",
  };

  readonly #addDirectoryItem: CTXMSubMenu = {
    text: "Add Directory",
    disabled: true,
    subMenu: [
      {
        element: () => FileSystemContextMenu.#createAddEntryItem(false, true, this.#addDirectory.bind(this)),
        disabled: true,
      }
    ],
    subMenuAttributes: {

    },
  }

  #addDirectory(newFileName: string): void {
    window.ctxmenu.hide();
  }

  readonly #addFileItem: CTXMSubMenu = {
    text: "Add File",
    disabled: true,
    subMenu: [
      {
        element: () => FileSystemContextMenu.#createAddEntryItem(false, true, this.#addFile.bind(this)),
        disabled: true,
      }
    ],
    subMenuAttributes: {

    },
  }

  #addFile(newFileName: string): void {
    window.ctxmenu.hide();
  }

  readonly #cutItem: CTXMAction = {
    text: "Cut",
    disabled: true,
    action(ev) {
      void(ev);
    },
  };

  readonly #copyItem: CTXMAction = {
    text: "Copy",
    action(ev) {
      void(ev);
    },
  };

  readonly #pasteItem: CTXMAction = {
    text: "Paste",
    disabled: true,
    action(ev) {
      void(ev);
    },
  };

  readonly #deleteItem: CTXMAction = {
    text: "Delete",
    disabled: true,
    action(ev) {
      void(ev);
    },
  }

  readonly #renameItem: CTXMSubMenu = {
    text: "Rename",
    disabled: true,
    subMenu: [
      {
        element: () => {
          const form: HTMLFormElement = FileSystemContextMenu.#createAddEntryItem(false, true, this.#renameFile.bind(this));
          (form.submitButton as HTMLButtonElement).textContent = "Rename";
          return form;
        },
        disabled: true,
      }
    ],
    subMenuAttributes: {

    },
  }

  #renameFile(newFileName: string): void {
    window.ctxmenu.hide();
  }

  #contextMenuConfig: CTXConfig = {
    onHide: () => this.#hideContextMenus(),
  }

  show(event: MouseEvent, pathToFile: string, isDirectory: boolean): void {
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

    window.ctxmenu.show(
      this.#menuDefinition,
      event,
      this.#contextMenuConfig
    );
  }

  #hideContextMenus(event?: MouseEvent): void {
    this.#fullPath = "";
  }
}
