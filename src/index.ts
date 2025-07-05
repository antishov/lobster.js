import { ISelectOption, SelectOption } from "./selectOption";

interface SelectConfig {
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
}

interface SelectEventDetail {
  value: string;
  label: string;
}

class SelectChangeEvent extends CustomEvent<SelectEventDetail> {
  constructor(detail: SelectEventDetail) {
    super("change", {
      detail,
      bubbles: true,
      cancelable: true,
    });
  }
}

declare global {
  interface HTMLElementEventMap {
    change: SelectChangeEvent;
  }
}

export class Select {
  private node!: HTMLDivElement;
  private selectButton!: HTMLElement;
  private buttonText!: HTMLElement;
  private dropdown!: HTMLElement;
  private searchInput?: HTMLInputElement;
  private shadowInput: HTMLSelectElement | null = null;
  private options: SelectOption[] = [];
  private selectedOption?: SelectOption;
  private isOpen = false;
  private config: SelectConfig;
  private outsideClickHandler!: (event: MouseEvent) => void;

  constructor(
    selector: string | HTMLDivElement | HTMLSelectElement,
    options: ISelectOption[] = [],
    config: SelectConfig = {}
  ) {
    this.initNode(selector);

    this.options =
      options.length === 0 && this.shadowInput !== null
        ? Array.from(this.shadowInput.querySelectorAll("option")).map((node) =>
            SelectOption.fromOption(node)
          )
        : options.map((option) => SelectOption.fromObject(option));
    this.config = {
      placeholder: "Select option",
      searchable: false,
      clearable: false,
      ...config,
    };

    this.init();
  }

  private init(): void {
    this.initSelectButton();
    this.initDropdown();
    this.initSearchInput();
    this.renderOptions();

    this.outsideClickHandler = this.handleOutsideClick.bind(this);

    document.addEventListener("click", this.outsideClickHandler);
  }

  private initNode(
    selector: string | HTMLDivElement | HTMLSelectElement
  ): void {
    if (typeof selector === "string") {
      const target = document.querySelector<HTMLElement>(selector);

      if (target === null) {
        throw new Error(`Element with selector "${selector}" not found`);
      }

      if (
        !(target instanceof HTMLDivElement) &&
        !(target instanceof HTMLSelectElement)
      ) {
        throw new Error(
          "Only HTMLDivElement and HTMLSelectElement are supported."
        );
      }

      selector = target;
    }

    let node: HTMLDivElement | null = null;

    if (selector instanceof HTMLSelectElement) {
      node = document.createElement("div");

      if (selector.parentElement === null) {
        throw new Error("Shadow input must have a parent element");
      } else {
        selector.parentElement.insertBefore(node, selector);
      }

      this.shadowInput = selector;
      this.shadowInput.classList.add("lobster-select__shadow-node");

      node.classList.add("has-shadow-node");
    } else {
      node = selector;
    }

    if (node.classList.contains("lobster-select")) {
      throw new Error(
        `Element with selector "${selector}" already initialized`
      );
    }

    this.node = node;
    this.node.classList.add("lobster-select");
  }

  private initDropdown(): void {
    this.dropdown = document.createElement("div");
    this.dropdown.classList.add("lobster-select__dropdown");
    this.node.appendChild(this.dropdown);
  }

  private initSelectButton(): void {
    this.selectButton = document.createElement("div");
    this.selectButton.classList.add("lobster-select__button");

    this.buttonText = document.createElement("span");

    this.buttonText.classList.add("lobster-select__button-text");
    this.buttonText.textContent = this.config.placeholder!;

    const buttonArrow = document.createElement("span");
    buttonArrow.classList.add("lobster-select__button-arrow");

    if (this.config.clearable) {
      const clearButton = document.createElement("span");

      clearButton.classList.add("lobster-select__clear-button");
      clearButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.clear();
        const event = new SelectChangeEvent({
          value: "",
          label: "",
        });
        this.node.dispatchEvent(event);
      });

      this.selectButton.appendChild(clearButton);
      this.node.classList.add("lobster-select--clearable");
    }

    this.selectButton.appendChild(this.buttonText);
    this.selectButton.appendChild(buttonArrow);

    this.node.appendChild(this.selectButton);
    this.selectButton.addEventListener("click", () => this.toggle());
  }

  private initSearchInput(): void {
    if (!this.config.searchable) {
      return;
    }

    const searchWrapper = document.createElement("div");
    searchWrapper.classList.add("lobster-select__search");

    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.placeholder = "Search...";
    this.searchInput.classList.add("lobster-select__search-input");

    searchWrapper.appendChild(this.searchInput);
    this.dropdown.appendChild(searchWrapper);

    this.searchInput.addEventListener("input", () => this.handleSearch());
  }

  private renderOptions(): void {
    const optionsList = document.createElement("div");
    optionsList.classList.add("lobster-select__options");

    this.options.forEach((option) => {
      const optionElement = document.createElement("div");
      optionElement.classList.add("lobster-select__option");

      if (option.disabled) {
        optionElement.classList.add("lobster-select__option--disabled");
      } else {
        optionElement.addEventListener("click", () =>
          this.selectOption(option)
        );
      }

      if (option.selected) {
        optionElement.classList.add("lobster-select__option--selected");

        if (this.selectedOption === undefined) {
          this.selectedOption = option;
          this.setButtonText(option.label);
        } else {
          throw new Error("Select can't contain more than one chosen option");
        }
      }

      optionElement.textContent = option.label;

      optionsList.appendChild(optionElement);
    });

    const existingOptions = this.dropdown.querySelector(
      ".lobster-select__options"
    );
    if (existingOptions) {
      this.dropdown.removeChild(existingOptions);
    }

    this.dropdown.appendChild(optionsList);
  }

  private handleSearch(): void {
    if (!this.searchInput) return;

    const searchTerm = this.searchInput.value.toLowerCase();
    const filteredOptions = this.options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm)
    );

    const optionsList = this.dropdown.querySelector(".lobster-select__options");
    if (optionsList) {
      optionsList.innerHTML = "";

      filteredOptions.forEach((option) => {
        const optionElement = document.createElement("div");
        optionElement.classList.add("lobster-select__option");
        if (option.disabled) {
          optionElement.classList.add("lobster-select__option--disabled");
        }
        optionElement.textContent = option.label;

        if (!option.disabled) {
          optionElement.addEventListener("click", () =>
            this.selectOption(option)
          );
        }

        optionsList.appendChild(optionElement);
      });
    }
  }

  private selectOption(option: SelectOption): void {
    this.selectedOption = option;

    this.setButtonText(option.label);

    this.node.classList.add("has-value");

    this.dropdown
      .querySelectorAll(".lobster-select__option")
      .forEach((optionEl, index) => {
        const isChosen = this.options[index].value === option.value;
        optionEl.classList.toggle("lobster-select__option--selected", isChosen);
      });

    this.close();

    if (this.shadowInput !== null) {
      this.shadowInput.value = option.value;
    }

    const event = new SelectChangeEvent({
      value: option.value,
      label: option.label,
    });

    this.node.dispatchEvent(event);
  }

  private toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  private open(): void {
    this.isOpen = true;
    this.node.classList.add("lobster-select--open");
    if (this.searchInput) {
      this.searchInput.focus();
    }
  }

  private close(): void {
    this.isOpen = false;
    this.node.classList.remove("lobster-select--open");
    if (this.searchInput) {
      this.searchInput.value = "";
      this.renderOptions();
    }
  }

  private handleOutsideClick(event: MouseEvent): void {
    if (!this.node.contains(event.target as Node)) {
      this.close();
    }
  }

  public getValue(): string | undefined {
    return this.selectedOption?.value;
  }

  public setValue(value: string): void {
    const option = this.options.find((opt) => opt.value === value);
    if (option) {
      this.selectOption(option);
    }
  }

  public clear(force: boolean = false): void {
    if (!this.config.clearable && !force) {
      console.warn("Clearable is disabled");
      return;
    }

    this.selectedOption = undefined;

    this.setButtonText();

    this.node.classList.remove("has-value");

    const options = this.dropdown.querySelectorAll(".lobster-select__option");
    options.forEach((option) => {
      option.classList.remove("lobster-select__option--selected");
    });
  }

  public updateOptions(options: ISelectOption[]): void {
    this.options = options.map((option) => SelectOption.fromObject(option));
    this.renderOptions();
  }

  public disable(): void {
    this.node.classList.add("lobster-select--disabled");
    this.selectButton.removeEventListener("click", () => this.toggle());
  }

  public enable(): void {
    this.node.classList.remove("lobster-select--disabled");
    this.selectButton.addEventListener("click", () => this.toggle());
  }

  public destroy(): void {
    this.node.innerHTML = "";
    this.node.classList.remove(...this.node.classList);

    if (this.shadowInput !== null) {
      this.shadowInput.classList.remove("lobster-select__shadow-node");
    }

    if (this.outsideClickHandler !== null) {
      document.removeEventListener("click", this.outsideClickHandler);
    }
  }

  private setButtonText(text: string | null = null): void {
    if (this.buttonText === undefined) {
      return;
    }

    this.buttonText.textContent = text ?? this.config.placeholder ?? "";
  }
}
