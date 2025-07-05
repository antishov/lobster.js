export interface ISelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    selected?: boolean;
}
export declare class SelectOption implements ISelectOption {
    readonly value: string;
    readonly label: string;
    readonly disabled: boolean;
    readonly selected: boolean;
    constructor(value: string, label: string, disabled: boolean, selected: boolean);
    static fromObject(option: ISelectOption): SelectOption;
    static fromOption(option: HTMLOptionElement): SelectOption;
}
