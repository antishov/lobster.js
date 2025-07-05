export interface ISelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  selected?: boolean;
}

export class SelectOption implements ISelectOption {
  constructor(
    public readonly value: string,
    public readonly label: string,
    public readonly disabled: boolean,
    public readonly selected: boolean
  ) {}

  public static fromObject(option: ISelectOption): SelectOption {
    return new SelectOption(
      option.value,
      option.label,
      option.disabled ?? false,
      option.selected ?? false
    );
  }

  public static fromOption(option: HTMLOptionElement): SelectOption {
    return new SelectOption(
      option.value,
      option.innerText,
      option.disabled,
      option.selected
    );
  }
}
