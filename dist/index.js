class SelectChangeEvent extends CustomEvent {
    constructor(detail) {
        super("change", {
            detail,
            bubbles: true,
            cancelable: true,
        });
    }
}
export class Select {
    constructor(selector, options = [], config = {}) {
        this.options = [];
        this.isOpen = false;
        const container = document.querySelector(selector);
        if (!container) {
            throw new Error(`Element with selector "${selector}" not found`);
        }
        this.container = container;
        this.options = options;
        this.config = Object.assign({ placeholder: "Select option", searchable: false, clearable: false }, config);
        this.init();
    }
    init() {
        // Create main elements
        this.container.classList.add("lobster-select");
        if (this.config.clearable) {
            this.container.classList.add("lobster-select--clearable");
        }
        // Create select button
        this.selectButton = document.createElement("div");
        this.selectButton.classList.add("lobster-select__button");
        const buttonText = document.createElement("span");
        buttonText.classList.add("lobster-select__button-text");
        buttonText.textContent = this.config.placeholder;
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
                this.container.dispatchEvent(event);
            });
            this.selectButton.appendChild(clearButton);
        }
        this.selectButton.appendChild(buttonText);
        this.selectButton.appendChild(buttonArrow);
        // Create dropdown
        this.dropdown = document.createElement("div");
        this.dropdown.classList.add("lobster-select__dropdown");
        // Add search if enabled
        if (this.config.searchable) {
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
        // Add options
        this.renderOptions();
        // Append elements
        this.container.appendChild(this.selectButton);
        this.container.appendChild(this.dropdown);
        // Add event listeners
        this.selectButton.addEventListener("click", () => this.toggle());
        document.addEventListener("click", (e) => this.handleOutsideClick(e));
    }
    renderOptions() {
        const optionsList = document.createElement("div");
        optionsList.classList.add("lobster-select__options");
        this.options.forEach((option) => {
            const optionElement = document.createElement("div");
            optionElement.classList.add("lobster-select__option");
            if (option.disabled) {
                optionElement.classList.add("lobster-select__option--disabled");
            }
            optionElement.textContent = option.label;
            if (!option.disabled) {
                optionElement.addEventListener("click", () => this.selectOption(option));
            }
            optionsList.appendChild(optionElement);
        });
        // Clear existing options
        const existingOptions = this.dropdown.querySelector(".lobster-select__options");
        if (existingOptions) {
            this.dropdown.removeChild(existingOptions);
        }
        this.dropdown.appendChild(optionsList);
    }
    handleSearch() {
        if (!this.searchInput)
            return;
        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredOptions = this.options.filter((option) => option.label.toLowerCase().includes(searchTerm));
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
                    optionElement.addEventListener("click", () => this.selectOption(option));
                }
                optionsList.appendChild(optionElement);
            });
        }
    }
    selectOption(option) {
        this.selectedOption = option;
        const buttonText = this.selectButton.querySelector(".lobster-select__button-text");
        if (buttonText) {
            buttonText.textContent = option.label;
        }
        this.container.classList.add("has-value");
        // Update selected state in options
        const options = this.dropdown.querySelectorAll(".lobster-select__option");
        options.forEach((optionEl, index) => {
            if (this.options[index].value === option.value) {
                optionEl.classList.add("lobster-select__option--selected");
            }
            else {
                optionEl.classList.remove("lobster-select__option--selected");
            }
        });
        this.close();
        const event = new SelectChangeEvent({
            value: option.value,
            label: option.label,
        });
        this.container.dispatchEvent(event);
    }
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
    open() {
        this.isOpen = true;
        this.container.classList.add("lobster-select--open");
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }
    close() {
        this.isOpen = false;
        this.container.classList.remove("lobster-select--open");
        if (this.searchInput) {
            this.searchInput.value = "";
            this.renderOptions();
        }
    }
    handleOutsideClick(event) {
        if (!this.container.contains(event.target)) {
            this.close();
        }
    }
    // Public methods
    getValue() {
        var _a;
        return (_a = this.selectedOption) === null || _a === void 0 ? void 0 : _a.value;
    }
    setValue(value) {
        const option = this.options.find((opt) => opt.value === value);
        if (option) {
            this.selectOption(option);
        }
    }
    clear(force = false) {
        if (!this.config.clearable && !force) {
            console.warn("Clearable is disabled");
            return;
        }
        this.selectedOption = undefined;
        const buttonText = this.selectButton.querySelector(".lobster-select__button-text");
        if (buttonText) {
            buttonText.textContent = this.config.placeholder || "";
        }
        this.container.classList.remove("has-value");
        // Remove selected state from options
        const options = this.dropdown.querySelectorAll(".lobster-select__option");
        options.forEach((option) => {
            option.classList.remove("lobster-select__option--selected");
        });
    }
    updateOptions(options) {
        this.options = options;
        this.renderOptions();
    }
    disable() {
        this.container.classList.add("lobster-select--disabled");
        this.selectButton.removeEventListener("click", () => this.toggle());
    }
    enable() {
        this.container.classList.remove("lobster-select--disabled");
        this.selectButton.addEventListener("click", () => this.toggle());
    }
}
