import {
  BaseView
} from "../../tab-panels/tab-panels-view.js";

export enum ValidFileOperations {
 clone = "clone",
 upload = "upload",
 rename = "rename",
 export = "export",
 delete = "delete",
 "*" = "*"
};

export class FileSystemSetView implements BaseView {
  readonly displayElement: HTMLFormElement;

  readonly operationSelect: HTMLSelectElement;
  readonly fileUploadPicker: HTMLInputElement;
  readonly uploadRoot: HTMLInputElement;
  readonly sourceSelector: HTMLInputElement;
  readonly targetInput: HTMLInputElement;
  readonly submitButton: HTMLButtonElement;

  readonly #opToElementsMap = new Map<ValidFileOperations, Map<HTMLInputElement, boolean>>([
    [ValidFileOperations.clone, new Map],
    [ValidFileOperations.upload, new Map],
    [ValidFileOperations.rename, new Map],
    [ValidFileOperations.export, new Map],
    [ValidFileOperations.delete, new Map],
  ]);

  constructor() {
    this.displayElement = document.getElementById("filesystem-controls-form") as HTMLFormElement;

    this.operationSelect = this.#getElement<HTMLSelectElement>("filesystem-operation");
    this.fileUploadPicker = this.#getElement("file-upload-picker");
    this.uploadRoot = this.#getElement("file-upload-root");
    this.sourceSelector = this.#getElement("file-system-source-selector");
    this.targetInput = this.#getElement("file-system-target");
    this.submitButton = this.#getElement("filesystem-submit");

    this.operationSelect.onchange = this.#updateElementsVisible.bind(this);

    this.displayElement.reset();
  }

  #getElement<T extends HTMLElement = HTMLInputElement>(id: string): T {
    const elem = this.displayElement.elements.namedItem(id) as T;
    if (elem instanceof HTMLInputElement) {
      const supportedOps: ReadonlySet<ValidFileOperations> = new Set((
        elem.dataset.supported?.split(",") ?? [ValidFileOperations["*"]]) as readonly ValidFileOperations[]
      );

      for (const [op, innerMap] of this.#opToElementsMap.entries()) {
        innerMap.set(elem, supportedOps.has(op) || supportedOps.has(ValidFileOperations["*"]));
      }
    }

    return elem;
  }

  #updateElementsVisible(event: Event): void {
    event.stopPropagation();

    const { selectedOperation } = this;
    if (!selectedOperation) {
      this.submitButton.disabled = true;

      const array: readonly HTMLInputElement[] = [
        this.fileUploadPicker,
        this.uploadRoot,
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

  #updateElemVisible(elem: HTMLInputElement, isSupported: boolean): void {
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
  }

  get selectedOperation(): ValidFileOperations | undefined {
    const value = this.operationSelect.value;
    if (value === "")
      return undefined;
    return value as unknown as ValidFileOperations;
  }
}
