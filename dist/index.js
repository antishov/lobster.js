import { SelectOption } from "./selectOption";
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
        this.shadowInput = null;
        this.options = [];
        this.isOpen = false;
        this.initNode(selector);
        this.options =
            options.length === 0 && this.shadowInput !== null
                ? Array.from(this.shadowInput.querySelectorAll("option")).map((node) => SelectOption.fromOption(node))
                : options.map((option) => SelectOption.fromObject(option));
        this.config = Object.assign({ placeholder: "Select option", searchable: false, clearable: false, autoclose: true }, config);
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
    initNode(selector) {
        if (typeof selector === "string") {
            const target = document.querySelector(selector);
            if (target === null) {
                throw new Error(`Element with selector "${selector}" not found`);
            }
            if (!(target instanceof HTMLDivElement) &&
                !(target instanceof HTMLSelectElement)) {
                throw new Error("Only HTMLDivElement and HTMLSelectElement are supported.");
            }
            selector = target;
        }
        let node = null;
        if (selector instanceof HTMLSelectElement) {
            node = document.createElement("div");
            if (selector.parentElement === null) {
                throw new Error("Shadow input must have a parent element");
            }
            else {
                selector.parentElement.insertBefore(node, selector);
            }
            this.shadowInput = selector;
            this.shadowInput.classList.add("lobster-select__shadow-node");
            node.classList.add("has-shadow-node");
        }
        else {
            node = selector;
        }
        if (node.classList.contains("lobster-select")) {
            throw new Error(`Element with selector "${selector}" already initialized`);
        }
        this.node = node;
        this.node.classList.add("lobster-select");
    }
    initDropdown() {
        this.dropdown = document.createElement("div");
        this.dropdown.classList.add("lobster-select__dropdown");
        this.node.appendChild(this.dropdown);
    }
    initSelectButton() {
        this.selectButton = document.createElement("div");
        this.selectButton.classList.add("lobster-select__button");
        this.buttonText = document.createElement("span");
        this.buttonText.classList.add("lobster-select__button-text");
        this.buttonText.textContent = this.config.placeholder;
        const buttonArrow = document.createElement("span");
        buttonArrow.classList.add("lobster-select__button-arrow", "li", "li-mark");
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
            else {
                optionElement.addEventListener("click", () => this.selectOption(option));
            }
            if (option.selected) {
                optionElement.classList.add("lobster-select__option--selected");
                if (this.selectedOption === undefined) {
                    this.selectedOption = option;
                    this.setButtonText(option.label);
                }
                else {
                    throw new Error("Select can't contain more than one chosen option");
                }
            }
            optionElement.textContent = option.label;
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
        this.setButtonText(option.label);
        this.node.classList.add("has-value");
        this.dropdown
            .querySelectorAll(".lobster-select__option")
            .forEach((optionEl, index) => this.toggleOptionChosenState(optionEl, this.options[index].value === option.value));
        if (this.config.autoclose) {
            this.close();
        }
        if (this.shadowInput !== null) {
            this.shadowInput.value = option.value;
        }
        const event = new SelectChangeEvent({
            value: option.value,
            label: option.label,
        });
        this.node.dispatchEvent(event);
    }
    toggleOptionChosenState(option, isChosen) {
        option.classList.toggle("lobster-select__option--selected", isChosen);
        let icon = option.querySelector(".lobster-select__option-check");
        if (icon === null && isChosen) {
            icon = document.createElement("div");
            icon.classList.add("lobster-select__option-check", "li", "li-check");
            option.appendChild(icon);
        }
        else if (!isChosen) {
            icon === null || icon === void 0 ? void 0 : icon.remove();
        }
    }
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
    open() {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;
        this.node.classList.add("lobster-select--open");
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }
    close() {
        if (!this.isOpen) {
            return;
        }
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
        this.setButtonText();
        this.node.classList.remove("has-value");
        this.dropdown
            .querySelectorAll(".lobster-select__option")
            .forEach((option) => this.toggleOptionChosenState(option, false));
        if (this.shadowInput !== null) {
            this.shadowInput.value = "";
        }
    }
    updateOptions(options) {
        this.options = options.map((option) => SelectOption.fromObject(option));
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
        this.node.innerHTML = "";
        this.node.classList.remove(...this.node.classList);
        if (this.shadowInput !== null) {
            this.shadowInput.classList.remove("lobster-select__shadow-node");
        }
        if (this.outsideClickHandler !== null) {
            document.removeEventListener("click", this.outsideClickHandler);
        }
    }
    setButtonText(text = null) {
        var _a;
        if (this.buttonText === undefined) {
            return;
        }
        this.buttonText.textContent = (_a = text !== null && text !== void 0 ? text : this.config.placeholder) !== null && _a !== void 0 ? _a : "";
    }
}
