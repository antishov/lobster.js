import { Select } from "./index";

describe("Select Component", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "select-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const mockOptions = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3", disabled: true },
  ];

  describe("Initialization", () => {
    it("should create select component with default config", () => {
      const select = new Select("#select-container", mockOptions);
      expect(
        container.firstElementChild?.classList.contains("lobster-select")
      ).toBeTruthy();
      expect(
        container.firstElementChild?.querySelector(".lobster-select__button")
      ).toBeTruthy();
      expect(
        container.firstElementChild?.querySelector(".lobster-select__dropdown")
      ).toBeTruthy();
    });

    it("should throw error for invalid selector", () => {
      expect(() => new Select("#non-existent", mockOptions)).toThrow();
    });

    it("should initialize with searchable option", () => {
      const select = new Select("#select-container", mockOptions, {
        searchable: true,
      });
      expect(
        container.firstElementChild?.querySelector(
          ".lobster-select__search-input"
        )
      ).toBeTruthy();
    });

    it("should initialize with clearable option", () => {
      const select = new Select("#select-container", mockOptions, {
        clearable: true,
      });
      expect(
        container.firstElementChild?.classList.contains(
          "lobster-select--clearable"
        )
      ).toBeTruthy();
      expect(
        container.firstElementChild?.querySelector(
          ".lobster-select__clear-button"
        )
      ).toBeTruthy();
    });
  });

  describe("Option Selection", () => {
    it("should select an option and trigger change event", () => {
      const select = new Select("#select-container", mockOptions);
      const changeHandler = jest.fn();
      container.firstElementChild?.addEventListener("change", changeHandler);

      const button = container.firstElementChild?.querySelector(
        ".lobster-select__button"
      ) as HTMLElement;
      button.click();

      const firstOption = container.firstElementChild?.querySelector(
        ".lobster-select__option"
      ) as HTMLElement;
      firstOption.click();

      expect(changeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            value: "1",
            label: "Option 1",
          },
        })
      );
      expect(
        container.firstElementChild?.classList.contains("has-value")
      ).toBeTruthy();
    });

    it("should not select disabled options", () => {
      const select = new Select("#select-container", mockOptions);
      const changeHandler = jest.fn();
      container.firstElementChild?.addEventListener("change", changeHandler);

      const button = container.firstElementChild?.querySelector(
        ".lobster-select__button"
      ) as HTMLElement;
      button.click();

      const options: NodeListOf<HTMLElement> | undefined =
        container.firstElementChild?.querySelectorAll(
          ".lobster-select__option"
        );

      if (options === undefined) {
        throw new Error("Options not found");
      }

      options[2].click();

      expect(changeHandler).not.toHaveBeenCalled();
    });
  });

  describe("Search Functionality", () => {
    it("should filter options based on search input", () => {
      const select = new Select("#select-container", mockOptions, {
        searchable: true,
      });

      const button = container.firstElementChild?.querySelector(
        ".lobster-select__button"
      ) as HTMLElement;
      button.click();

      const searchInput = container.firstElementChild?.querySelector(
        ".lobster-select__search-input"
      ) as HTMLInputElement;
      searchInput.value = "Option 1";
      searchInput.dispatchEvent(new Event("input"));

      const visibleOptions: NodeListOf<HTMLElement> | undefined =
        container.firstElementChild?.querySelectorAll(
          ".lobster-select__option"
        );

      if (visibleOptions === undefined) {
        throw new Error("Visible options not found");
      }

      expect(visibleOptions.length).toBe(1);
      expect(visibleOptions[0].textContent).toBe("Option 1");
    });
  });

  describe("Public Methods", () => {
    it("should get and set value correctly", () => {
      const select = new Select("#select-container", mockOptions);

      select.setValue("2");
      expect(select.getValue()).toBe("2");

      const buttonText = container.firstElementChild?.querySelector(
        ".lobster-select__button-text"
      );
      expect(buttonText?.textContent).toBe("Option 2");
    });

    it("should clear selection", () => {
      const select = new Select("#select-container", mockOptions, {
        clearable: true,
      });

      select.setValue("2");
      select.clear();

      expect(select.getValue()).toBeUndefined();
      expect(
        container.firstElementChild?.classList.contains("has-value")
      ).toBeFalsy();
    });

    it("should update options", () => {
      const select = new Select("#select-container", mockOptions);
      const newOptions = [{ value: "4", label: "New Option" }];

      select.updateOptions(newOptions);

      const options = container.firstElementChild?.querySelectorAll(
        ".lobster-select__option"
      );

      if (options === undefined) {
        throw new Error("Options not found");
      }

      expect(options.length).toBe(1);
      expect(options[0].textContent).toBe("New Option");
    });

    it("should handle disable and enable", () => {
      const select = new Select("#select-container", mockOptions);

      select.disable();
      expect(
        container.firstElementChild?.classList.contains(
          "lobster-select--disabled"
        )
      ).toBeTruthy();

      select.enable();
      expect(
        container.firstElementChild?.classList.contains(
          "lobster-select--disabled"
        )
      ).toBeFalsy();
    });

    it("should destroy the component", () => {
      const documentSpy = jest.spyOn(document, "removeEventListener");
      const select = new Select("#select-container", mockOptions);

      select.destroy();
      expect(container.firstElementChild).toBeNull();

      expect(documentSpy).toHaveBeenCalled();
      documentSpy.mockRestore();
    });
  });
});
