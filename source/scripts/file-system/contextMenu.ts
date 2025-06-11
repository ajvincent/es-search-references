import "../../lib/packages/ctxmenu.js";

import type {
  CTXMAction,
  CTXMDivider,
  CTXMenu,
  CTXMHeading,
} from "../../lib/packages/ctxmenu.js";

import type {
  FileSystemControllerIfc
} from "./controller.js";

export class FileSystemContextMenu {
  static readonly #CAPTURE_PASSIVE = Object.freeze({
    capture: true,
    passive: true
  });

  static #dividerItem: CTXMDivider = {
    isDivider: true
  };

  readonly #controller: FileSystemControllerIfc;
  #fullPath?: string;
  readonly #menuDefinition: CTXMenu;

  constructor(controller: FileSystemControllerIfc) {
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

    const treeRows: HTMLElement = this.#controller.getTreeRowsElement();
    treeRows.addEventListener(
      "contextmenu",
      event => this.#showContextMenu(event)
    );
    treeRows.addEventListener(
      "click",
      event => this.#hideContextMenus(event),
      FileSystemContextMenu.#CAPTURE_PASSIVE
    );
  }

  readonly #headerItem: CTXMHeading = {
    text: "Hello World",
  };

  readonly #addFileItem: CTXMAction = {
    text: "Add File",
    disabled: true,
    action(ev) {
      void(ev);
    },
  }

  readonly #addDirectoryItem: CTXMAction = {
    text: "Add Directory",
    disabled: true,
    action(ev) {
      void(ev);
    },
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

  readonly #renameItem: CTXMAction = {
    text: "Rename",
    disabled: true,
    action(ev) {
      void(ev);
    },
  }

  #showContextMenu(event: MouseEvent): void {
    event.stopPropagation();

    let target = event!.target as HTMLElement;
    while (!target.dataset.fullpath) {
      target = target.parentElement!;
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

  #hideContextMenus(event: MouseEvent): void {
    window.ctxmenu.hide();
    this.#fullPath = undefined;
  }
}
