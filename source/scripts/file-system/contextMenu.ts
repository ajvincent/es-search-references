import "../../lib/packages/ctxmenu.js";

import type {
  CTXConfig,
  CTXMAction,
  CTXMDivider,
  CTXMenu,
  CTXMHeading,
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

  readonly #controller: FSControllerCallbacksIfc;
  #fullPath = "";
  readonly #menuDefinition: CTXMenu;

  constructor(controller: FSControllerCallbacksIfc) {
    this.#controller = controller;
    this.#fullPath = "";

    this.#menuDefinition = [
      this.#headerItem,
      FileSystemContextMenu.#dividerItem,
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

  readonly #headerItem: CTXMHeading = {
    text: "",
  };

  readonly #addFileItem: CTXMAction = {
    text: "Add File",
    disabled: true,
    action: (ev) => {
      /*
      this.#controller.startAddFile(this.#fullPath!);
      this.#fullPath = "";
      */
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

  #contextMenuConfig: CTXConfig = {
    onHide: () => this.#hideContextMenus(),
  }

  show(event: MouseEvent, pathToFile: string, isDirectory: boolean): void {
    this.#fullPath = pathToFile;
    if (this.#fullPath.endsWith("://"))
      this.#headerItem.text = this.#fullPath;
    else
      this.#headerItem.text = this.#fullPath.replace(/^.*\//g, "");

    const { isReadOnly, clipBoardHasCopy } = this.#controller;
    this.#addFileItem.disabled = isReadOnly || !isDirectory;
    this.#cutItem.disabled = isReadOnly;
    this.#pasteItem.disabled = isReadOnly || !clipBoardHasCopy;
    this.#deleteItem.disabled = isReadOnly;
    this.#renameItem.disabled = isReadOnly;

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
