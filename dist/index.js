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
        this.options = options;
        this.config = Object.assign({ placeholder: "Select option", searchable: false, clearable: false }, config);
        this.initContainer(selector);
        this.init();
    }
    init() {
        this.initSelectButton();
        this.initDropdown();
        this.initSearchInput();
        this.renderOptions();
        this.outsideClickHandler = this.handleOutsideClick.bind(this);
        document.addEventListener("click", this.outsideClickHandler);
    }
    initContainer(selector) {
        const container = document.querySelector(selector);
        if (container === null) {
            throw new Error(`Element with selector "${selector}" not found`);
        }
        this.container = container;
        this.node = document.createElement("div");
        this.node.classList.add("lobster-select");
        this.container.appendChild(this.node);
    }
    initDropdown() {
        this.dropdown = document.createElement("div");
        this.dropdown.classList.add("lobster-select__dropdown");
        this.node.appendChild(this.dropdown);
    }
    initSelectButton() {
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
                this.node.dispatchEvent(event);
            });
            this.selectButton.appendChild(clearButton);
            this.node.classList.add("lobster-select--clearable");
        }
        this.selectButton.appendChild(buttonText);
        this.selectButton.appendChild(buttonArrow);
        this.node.appendChild(this.selectButton);
        this.selectButton.addEventListener("click", () => this.toggle());
    }
    initSearchInput() {
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
        this.node.classList.add("has-value");
        this.dropdown
            .querySelectorAll(".lobster-select__option")
            .forEach((optionEl, index) => {
            const isChosen = this.options[index].value === option.value;
            optionEl.classList.toggle("lobster-select__option--selected", isChosen);
        });
        this.close();
        const event = new SelectChangeEvent({
            value: option.value,
            label: option.label,
        });
        this.node.dispatchEvent(event);
    }
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
    open() {
        this.isOpen = true;
        this.node.classList.add("lobster-select--open");
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }
    close() {
        this.isOpen = false;
        this.node.classList.remove("lobster-select--open");
        if (this.searchInput) {
            this.searchInput.value = "";
            this.renderOptions();
        }
    }
    handleOutsideClick(event) {
        if (!this.node.contains(event.target)) {
            this.close();
        }
    }
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
        this.node.classList.remove("has-value");
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
        this.node.classList.add("lobster-select--disabled");
        this.selectButton.removeEventListener("click", () => this.toggle());
    }
    enable() {
        this.node.classList.remove("lobster-select--disabled");
        this.selectButton.addEventListener("click", () => this.toggle());
    }
    destroy() {
        this.node.remove();
        if (this.outsideClickHandler !== null) {
            document.removeEventListener("click", this.outsideClickHandler);
        }
    }
}
