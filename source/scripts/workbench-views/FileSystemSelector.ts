import {
  FileSystemSetController,
} from "../file-system/setController.js";

import {
  OPFSFrontEnd
} from "../opfs/client/FrontEnd.js";

import type {
  FileSystemsRecords,
  UUID
} from "../opfs/types/messages.js";

export class FileSystemSelectorView {
  static #controlsValue = "filesystem-controls";

  readonly #selectElement: HTMLSelectElement;
  readonly #fsSelectCallback: (key: UUID) => void;
  readonly #fsControlsCallback: () => void;

  readonly #optionsMap = new Map<string, HTMLOptionElement>;

  constructor(
    selectElement: HTMLSelectElement,
    fsSelectCallback: (key: UUID) => void,
    fsControlsCallback: () => void
  )
  {
    this.#selectElement = selectElement;
    this.#fsSelectCallback = fsSelectCallback;
    this.#fsControlsCallback = fsControlsCallback;

    this.#selectElement.onchange = this.#handleSelect.bind(this);
  }

  get currentValue(): string {
    return this.#selectElement.value;
  }

  selectOption(key: UUID) {
    this.#selectElement.value = "fss:" + key;
    this.#fsSelectCallback(key);
  }

  clearOptions(): void
  {
    const controlsOption: HTMLOptionElement = this.#selectElement.options.namedItem(
      FileSystemSelectorView.#controlsValue
    )!;
    this.#selectElement.replaceChildren(controlsOption);
    this.#optionsMap.clear();
  }

  async fillOptions(
    frontEnd: OPFSFrontEnd
  ): Promise<void>
  {
    const fileSystems: FileSystemsRecords = await frontEnd.getAvailableSystems();

    const options: HTMLOptionElement[] = [];
    let refSpecOption: HTMLOptionElement;
    const systemIterator = Object.entries(fileSystems) as [UUID, string][];
    for (const [systemKey, fileSystemDescriptor] of systemIterator) {
      const option: HTMLOptionElement = document.createElement("option");
      option.value = "fss:" + systemKey;
      option.append(fileSystemDescriptor);
      this.#optionsMap.set(fileSystemDescriptor, option);
      if (fileSystemDescriptor === FileSystemSetController.referenceFSLabel) {
        refSpecOption = option;
      }
      else {
        options.push(option);
      }
    }

    if (options.length) {
      options.sort((a, b) => a.text.localeCompare(b.text));
      this.#selectElement.append(...options);
    }
    this.#selectElement.prepend(refSpecOption!);
  }

  hasOptionByDescription(
    description: string
  ): boolean
  {
    return this.#optionsMap.has(description);
  }

  hideOptionByDescription(
    description: string
  ): void
  {
    const option = this.#optionsMap.get(description);
    if (option) {
      option.remove();
      this.#optionsMap.delete(description);
    }
  }

  #handleSelect(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const { value } = this.#selectElement;
    if (value === "filesystem-controls") {
      this.#fsControlsCallback();
    } else {
      this.#fsSelectCallback(value.substring(4) as UUID);
    }
  }
}
