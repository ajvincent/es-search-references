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

import type {
  FSContextMenuShowArgumentsIfc
} from "./types/FSContextMenuShowArgumentsIfc.js";

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
    submitCallback: (newFilePath: string) => void,
    nameChangeCallback: (newFilePath: string) => string,
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
    newFilePath.onchange = ev => {
      ev.stopPropagation();
      newFilePath.setCustomValidity(nameChangeCallback(newFilePath.value));
    }

    form.onsubmit = ev => {
      ev.stopPropagation();
      ev.preventDefault();
      submitCallback(newFilePath.value);
    }
    return form;
  }

  readonly #controller: FSControllerCallbacksIfc;
  readonly #menuDefinition: CTXMenu;
  #showArguments?: FSContextMenuShowArgumentsIfc;

  constructor(controller: FSControllerCallbacksIfc) {
    this.#controller = controller;

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

  #siblingNameInUse(localName: string): string {
    if (this.#showArguments!.pathIsProtocol)
      localName += "://";
    if (this.#showArguments!.currentSiblings.has(localName))
      return "This name is in use.";
    return "";
  }

  #childNameInUse(localName: string): string {
    if (this.#showArguments!.currentChildren.has(localName))
      return "This name is in use.";
    return "";
  }

  readonly #topLevelHeaderItem: CTXMHeading = {
    text: "FileSystem"
  };

  readonly #addPackageItem: CTXMSubMenu = {
    text: "Add Package",
    disabled: true,
    subMenu: [
      {
        element: () => FileSystemContextMenu.#createAddEntryItem(
          false, false, this.#addPackage.bind(this), this.#packageNameInUse.bind(this)
        ),
        disabled: true,
      }
    ],
    subMenuAttributes: {

    }
  };

  async #addPackage(newPackageName: string): Promise<void> {
    window.ctxmenu.hide();
    await this.#controller.addPackage(newPackageName);
  }

  #packageNameInUse(packageName: string): string {
    if (this.#showArguments!.currentPackages.has(packageName))
      return "This package name is in use.";
    return "";
  }

  readonly #addProtocolItem: CTXMSubMenu = {
    text: "Add Protocol",
    disabled: true,
    subMenu: [
      {
        element: () => FileSystemContextMenu.#createAddEntryItem(
          true, false, this.#addProtocol.bind(this), this.#protocolNameInUse.bind(this)
        ),
        disabled: true,
      }
    ],
    subMenuAttributes: {

    }
  };

  async #addProtocol(newProtocolName: string): Promise<void> {
    window.ctxmenu.hide();
    await this.#controller.addProtocol((newProtocolName + "://") as `${string}://`);
  }

  #protocolNameInUse(newProtocolName: string): string {
    if (this.#showArguments!.currentProtocols.has(newProtocolName + "://")) {
      return "This protocol name is in use.";
    }
    return "";
  }

  readonly #localHeaderItem: CTXMHeading = {
    text: "",
  };

  readonly #addDirectoryItem: CTXMSubMenu = {
    text: "Add Directory",
    disabled: true,
    subMenu: [
      {
        element: () => FileSystemContextMenu.#createAddEntryItem(
          false, true, this.#addDirectory.bind(this), this.#childNameInUse.bind(this)
        ),
        disabled: true,
      }
    ],
    subMenuAttributes: {

    },
  }

  async #addDirectory(newFileName: string): Promise<void> {
    window.ctxmenu.hide();
    await this.#controller.addFile(this.#showArguments!.pathToFile, newFileName, true);
  }

  readonly #addFileItem: CTXMSubMenu = {
    text: "Add File",
    disabled: true,
    subMenu: [
      {
        element: () => FileSystemContextMenu.#createAddEntryItem(
          false, true, this.#addFile.bind(this), this.#childNameInUse.bind(this)
        ),
        disabled: true,
      }
    ],
    subMenuAttributes: {
    },
  }

  async #addFile(newFileName: string): Promise<void> {
    window.ctxmenu.hide();
    await this.#controller.addFile(this.#showArguments!.pathToFile, newFileName, false);
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
    action: async (ev) => {
      await this.#controller.deleteFile(this.#showArguments!.pathToFile);
    },
  }

  readonly #renameItem: CTXMSubMenu = {
    text: "Rename",
    disabled: true,
    subMenu: [
      {
        element: () => {
          const form: HTMLFormElement = FileSystemContextMenu.#createAddEntryItem(
            this.#showArguments!.pathIsProtocol, true, this.#renameFile.bind(this), this.#siblingNameInUse.bind(this)
          );
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

  show(
    showArgs: FSContextMenuShowArgumentsIfc
  ): void
  {
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

    window.ctxmenu.show(
      this.#menuDefinition,
      showArgs.event,
      this.#contextMenuConfig
    );
  }

  #hideContextMenus(event?: MouseEvent): void {
    // do nothing (for now)
  }
}
