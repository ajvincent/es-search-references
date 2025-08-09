import {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

import type {
  OPFSFrontEnd
} from "../../opfs/client/FrontEnd.js";

export enum ValidFileOperations {
  clone = "clone",
  upload = "upload",
  rename = "rename",
  export = "export",
  delete = "delete",
  "*" = "*"
};

export class FileSystemSetView implements BaseView {
  static #createOption(keyAndLabel: [string, string]): HTMLOptionElement {
    const [fsKey, label] = keyAndLabel;
    const option = document.createElement("option");
    option.value = fsKey;
    option.append(label);
    return option;
  }

  readonly #fsFrontEnd: OPFSFrontEnd;

  readonly displayElement: HTMLFormElement;

  readonly operationSelect: HTMLSelectElement;
  readonly fileUploadPicker: HTMLInputElement;
  readonly uploadRoot: HTMLInputElement;
  readonly sourceSelector: HTMLSelectElement;
  readonly targetInput: HTMLInputElement;
  readonly submitButton: HTMLButtonElement;

  readonly #opToElementsMap = new Map<ValidFileOperations, Map<HTMLInputElement | HTMLSelectElement, boolean>>([
    [ValidFileOperations.clone, new Map],
    [ValidFileOperations.upload, new Map],
    [ValidFileOperations.rename, new Map],
    [ValidFileOperations.export, new Map],
    [ValidFileOperations.delete, new Map],
  ]);

  constructor(fsFrontEnd: OPFSFrontEnd)
  {
    this.#fsFrontEnd = fsFrontEnd;

    this.displayElement = document.getElementById("filesystem-controls-form") as HTMLFormElement;

    this.operationSelect = this.#getElement<HTMLSelectElement>("filesystem-operation");
    this.fileUploadPicker = this.#getElement<HTMLInputElement>("file-upload-picker");
    this.uploadRoot = this.#getElement<HTMLInputElement>("file-upload-root");
    this.sourceSelector = this.#getElement<HTMLSelectElement>("file-system-source-selector");
    this.targetInput = this.#getElement<HTMLInputElement>("file-system-target");
    this.submitButton = this.#getElement<HTMLButtonElement>("filesystem-submit");

    this.operationSelect.onchange = this.#handleOperationSelect.bind(this);
    this.targetInput.onchange = this.#customValidateTarget.bind(this);
  }

  dispose(): void {
    throw new Error("not implemented, this is a singleton");
  }

  handleActivated(): void {
    this.updateExistingSystemSelector();
  };

  #handleOperationSelect(event: Event): void {
    event.stopPropagation();
    this.updateExistingSystemSelector();
    this.#updateElementsVisible();
  }

  async updateExistingSystemSelector(): Promise<void> {
    const currentSystems: Record<string, string> = await this.#fsFrontEnd.fsManager.getAvailableSystems();
    const options: HTMLOptionElement[] = Object.entries(currentSystems).map(FileSystemSetView.#createOption);
    if (this.operationSelect.value !== "rename" && this.operationSelect.value !== "delete") {
      /*
      options.unshift(FileSystemSetView.#referenceFileOption);
      */
    }
    this.sourceSelector.replaceChildren(...options);
  }

  #getElement<
    T extends HTMLInputElement | HTMLSelectElement | HTMLButtonElement
  >
  (
    id: string,
  ): T
  {
    const elem = this.displayElement.elements.namedItem(id) as T;
    if (elem instanceof HTMLButtonElement)
      return elem;

    if (elem.dataset.supported) {
      const supportedOps: ReadonlySet<ValidFileOperations> = new Set((
        elem.dataset.supported?.split(",") ?? [ValidFileOperations["*"]]) as readonly ValidFileOperations[]
      );

      for (const [op, innerMap] of this.#opToElementsMap.entries()) {
        innerMap.set(elem, supportedOps.has(op) || supportedOps.has(ValidFileOperations["*"]));
      }
    }

    return elem;
  }

  #updateElementsVisible(): void {
    const { selectedOperation } = this;
    if (!selectedOperation) {
      this.submitButton.disabled = true;

      const array: readonly (HTMLInputElement | HTMLSelectElement)[] = [
        this.fileUploadPicker,
        this.uploadRoot,
        this.sourceSelector,
        this.targetInput,
      ]
      for (const elem of array) {
        this.#updateElemVisible(elem, false);
      }
      return;
    }

    const innerMap = this.#opToElementsMap.get(selectedOperation)!;
    for (const [elem, isSupported] of innerMap) {
      this.#updateElemVisible(elem, isSupported);
    }

    this.submitButton.disabled = false;
  }

  #updateElemVisible(elem: HTMLInputElement | HTMLSelectElement, isSupported: boolean): void {
    if (isSupported) {
      elem.classList.remove("hidden");
      elem.previousElementSibling!.classList.remove("hidden");
      elem.disabled = false;
      elem.required = true;
    } else {
      elem.classList.add("hidden");
      elem.previousElementSibling!.classList.add("hidden");
      elem.disabled = true;
      elem.required = false;
    }

    if (elem instanceof HTMLInputElement) {
      elem.value = "";
    } else {
      elem.selectedIndex = -1;
    }
  }

  get selectedOperation(): ValidFileOperations | undefined {
    const value = this.operationSelect.value;
    if (value === "")
      return undefined;
    return value as unknown as ValidFileOperations;
  }

  #customValidateTarget(event: Event): void {
    const { value } = this.targetInput;
    if (value === "reference-spec-filesystem" || value === "File system controls") {
      this.targetInput.setCustomValidity("This file system name is reserved.");
    } else {
      this.targetInput.setCustomValidity("");
    }
  }
}
