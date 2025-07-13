import { Select } from "./index";

describe("Select Component", () => {
  let container: HTMLDivElement;
  let shadowInput: HTMLSelectElement;

  beforeEach(() => {
    shadowInput = document.createElement("select");
    shadowInput.id = "shadow-input";
    document.body.appendChild(shadowInput);

    const shadowOption1 = document.createElement("option");
    shadowOption1.value = "1";
    shadowOption1.innerText = "Shadow option 1";

    shadowInput.appendChild(shadowOption1);

    const shadowOption2 = document.createElement("option");
    shadowOption2.value = "2";
    shadowOption2.innerText = "Shadow option 2";
    shadowOption2.selected = true;

    shadowInput.appendChild(shadowOption2);

    const shadowOption3 = document.createElement("option");
    shadowOption3.value = "3";
    shadowOption3.innerText = "Shadow option 3";
    shadowOption3.disabled = true;

    shadowInput.appendChild(shadowOption3);

    container = document.createElement("div");
    container.id = "select-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    Array.from(document.body.childNodes).forEach((node) =>
      document.body.removeChild(node)
    );
  });

  const mockOptions = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3", disabled: true },
  ];

  describe("Initialization", () => {
    it("should create select component with default config", () => {
      const select = new Select("#select-container", mockOptions);
      expect(container.classList.contains("lobster-select")).toBeTruthy();
      expect(container.querySelector(".lobster-select__button")).toBeTruthy();
      expect(container.querySelector(".lobster-select__dropdown")).toBeTruthy();
    });

    describe("should throw error for", () => {
      it("invalid selector", () => {
        expect(() => new Select("#non-existent", mockOptions)).toThrow();
      });

      it("already initialized", () => {
        const select = new Select("#select-container", mockOptions);
        expect(() => new Select("#select-container", mockOptions)).toThrow();
      });
    });

    describe("should initialize with", () => {
      it("HTMLDivElement as a container", () => {
        const select = new Select(container, mockOptions);
        expect(container.classList.contains("lobster-select")).toBeTruthy();
      });

      it("HTMLSelectElement as a container", () => {
        const select = new Select(shadowInput);

        expect(shadowInput.previousElementSibling).toBeInstanceOf(
          HTMLDivElement
        );
        expect(
          shadowInput.previousElementSibling?.classList.contains(
            "lobster-select"
          )
        ).toBeTruthy();
        expect(
          shadowInput.previousElementSibling?.classList.contains(
            "has-shadow-node"
          )
        ).toBeTruthy();
        expect(
          shadowInput.classList.contains("lobster-select__shadow-node")
        ).toBeTruthy();
      });

      it("HTMLSelectElement options", () => {
        const select = new Select(shadowInput);

        const button = shadowInput.previousElementSibling?.querySelector(
          ".lobster-select__button"
        ) as HTMLElement;
        button.click();

        const options: NodeListOf<HTMLElement> | undefined =
          shadowInput.previousElementSibling?.querySelectorAll(
            ".lobster-select__option"
          );

        if (options === undefined) {
          throw new Error("Options not found");
        }

        expect(options).toHaveLength(3);
        expect(
          options[1].classList.contains("lobster-select__option--selected")
        ).toBeTruthy();
        expect(
          options[2].classList.contains("lobster-select__option--disabled")
        ).toBeTruthy();
        expect(select.getValue()).toEqual("2");
        expect(
          shadowInput.previousElementSibling?.querySelector<HTMLElement>(
            ".lobster-select__button-text"
          )?.textContent
        ).toEqual("Shadow option 2");
      });

      it("searchable option", () => {
        const select = new Select("#select-container", mockOptions, {
          searchable: true,
        });
        expect(
          container.querySelector(".lobster-select__search-input")
        ).toBeTruthy();
      });

      describe("clearable option", () => {
        it("should clear selected option", () => {
          const select = new Select("#select-container", mockOptions, {
            clearable: true,
          });

          select.setValue("2");

          expect(
            container.classList.contains("lobster-select--clearable")
          ).toBeTruthy();

          const button = container.querySelector(
            ".lobster-select__clear-button"
          ) as HTMLElement;

          expect(button).toBeTruthy();
          button.click();

          expect(
            container.querySelector(".lobster-select__option--selected")
          ).toBeFalsy();
          expect(
            container.querySelector(".lobster-select__option-check")
          ).toBeFalsy();
        });
      });

      describe("autoclose option", () => {
        it("disabled", () => {
          const select = new Select(container, mockOptions, {
            autoclose: false,
          });

          const button = container.querySelector(
            ".lobster-select__button"
          ) as HTMLElement;
          button.click();

          const firstOption = container.querySelector(
            ".lobster-select__option"
          ) as HTMLElement;
          firstOption.click();

          expect(
            container.classList.contains("lobster-select--open")
          ).toBeTruthy();
        });

        it("enabled", () => {
          const select = new Select(container, mockOptions, {
            autoclose: true,
          });

          const button = container.querySelector(
            ".lobster-select__button"
          ) as HTMLElement;
          button.click();

          const firstOption = container.querySelector(
            ".lobster-select__option"
          ) as HTMLElement;
          firstOption.click();

          expect(
            container.classList.contains("lobster-select--open")
          ).toBeFalsy();
        });

        it("default behavior", () => {
          const select = new Select(container, mockOptions);

          const button = container.querySelector(
            ".lobster-select__button"
          ) as HTMLElement;
          button.click();

          const firstOption = container.querySelector(
            ".lobster-select__option"
          ) as HTMLElement;
          firstOption.click();

          expect(
            container.classList.contains("lobster-select--open")
          ).toBeFalsy();
        });
      });
    });
  });

  describe("Option Selection", () => {
    it("should select an option and trigger change event", () => {
      const select = new Select("#select-container", mockOptions);
      const changeHandler = jest.fn();
      container.addEventListener("change", changeHandler);

      const button = container.querySelector(
        ".lobster-select__button"
      ) as HTMLElement;
      button.click();

      const firstOption = container.querySelector(
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
      expect(container.classList.contains("has-value")).toBeTruthy();
    });

    it("should not select disabled options", () => {
      const select = new Select("#select-container", mockOptions);
      const changeHandler = jest.fn();
      container.addEventListener("change", changeHandler);

      const button = container.querySelector(
        ".lobster-select__button"
      ) as HTMLElement;
      button.click();

      const options: NodeListOf<HTMLElement> = container.querySelectorAll(
        ".lobster-select__option"
      );

      options[2].click();

      expect(changeHandler).not.toHaveBeenCalled();
    });

    describe("should pass the value to the shadow input", () => {
      it("by programmatic control", () => {
        const select = new Select(shadowInput);
        select.setValue("3");

        expect(shadowInput.value).toBe("3");
      });

      it("by user interaction", () => {
        const select = new Select(shadowInput);

        const button = shadowInput.previousElementSibling?.querySelector(
          ".lobster-select__button"
        ) as HTMLElement;
        button.click();

        const options: NodeListOf<HTMLElement> | undefined =
          shadowInput.previousElementSibling?.querySelectorAll(
            ".lobster-select__option"
          );

        if (options === undefined) {
          throw new Error("Options not found");
        }

        options[0].click();

        expect(shadowInput.value).toBe("1");
      });
    });
  });

  describe("Search Functionality", () => {
    it("should filter options based on search input", () => {
      const select = new Select("#select-container", mockOptions, {
        searchable: true,
      });

      const button = container.querySelector(
        ".lobster-select__button"
      ) as HTMLElement;
      button.click();

      const searchInput = container.querySelector(
        ".lobster-select__search-input"
      ) as HTMLInputElement;
      searchInput.value = "Option 1";
      searchInput.dispatchEvent(new Event("input"));

      const visibleOptions: NodeListOf<HTMLElement> =
        container.querySelectorAll(".lobster-select__option");

      expect(visibleOptions.length).toBe(1);
      expect(visibleOptions[0].textContent).toBe("Option 1");
    });
  });

  describe("Public Methods", () => {
    it("should get and set value correctly", () => {
      const select = new Select("#select-container", mockOptions);

      select.setValue("2");
      expect(select.getValue()).toBe("2");

      const buttonText = container.querySelector(
        ".lobster-select__button-text"
      );
      expect(buttonText?.textContent).toBe("Option 2");
    });

    it("should clear selection", () => {
      const select = new Select(shadowInput, [], {
        clearable: true,
      });

      select.setValue("2");
      select.clear();

      expect(select.getValue()).toBeUndefined();
      expect(container.classList.contains("has-value")).toBeFalsy();
      expect(shadowInput.value).toBe("");
      expect(
        container.querySelector(".lobster-select__option-check")
      ).toBeFalsy();
    });

    it("should update options", () => {
      const select = new Select("#select-container", mockOptions);
      const newOptions = [{ value: "4", label: "New Option" }];

      select.updateOptions(newOptions);

      const option = container.querySelector(
        ".lobster-select__option"
      ) as HTMLElement;

      expect(
        option.querySelector<HTMLElement>(".lobster-select__option-label")
          ?.innerText
      ).toBe("New Option");
    });

    it("should handle disable and enable", () => {
      const select = new Select("#select-container", mockOptions);

      select.disable();
      expect(
        container.classList.contains("lobster-select--disabled")
      ).toBeTruthy();

      select.enable();
      expect(
        container.classList.contains("lobster-select--disabled")
      ).toBeFalsy();
    });

    describe("destroy", () => {
      it("should destroy the component", () => {
        const documentSpy = jest.spyOn(document, "removeEventListener");
        const select = new Select("#select-container", mockOptions);

        select.destroy();
        expect(container.innerHTML).toEqual("");
        expect(container.classList.length).toEqual(0);

        expect(documentSpy).toHaveBeenCalled();
        documentSpy.mockRestore();
      });

      it("should unhide shadow input", () => {
        const select = new Select(shadowInput, mockOptions);

        select.destroy();

        expect(
          shadowInput.classList.contains("lobster-select__shadow-node")
        ).toBeFalsy();
      });
    });

    it("should select option only once", () => {
      const select = new Select("#select-container", mockOptions);

      select.setValue("2");
      select.setValue("2");

      expect(
        container.querySelectorAll(".lobster-select__option-check").length
      ).toBe(1);
      expect(
        container
          .querySelectorAll<HTMLElement>(".lobster-select__option")[1]
          .classList.contains("lobster-select__option--selected")
      ).toBeTruthy();
    });
  });
});
