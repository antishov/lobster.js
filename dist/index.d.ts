import { ISelectOption } from "./selectOption";
interface SelectConfig {
    placeholder?: string;
    searchable?: boolean;
    clearable?: boolean;
    autoclose?: boolean;
}
interface SelectEventDetail {
    value: string;
    label: string;
}
declare class SelectChangeEvent extends CustomEvent<SelectEventDetail> {
    constructor(detail: SelectEventDetail);
}
declare global {
    interface HTMLElementEventMap {
        change: SelectChangeEvent;
    }
}
export declare class Select {
    private node;
    private selectButton;
    private buttonText;
    private dropdown;
    private searchInput?;
    private shadowInput;
    private options;
    private selectedOption?;
    private isOpen;
    private config;
    private outsideClickHandler;
    constructor(selector: string | HTMLDivElement | HTMLSelectElement, options?: ISelectOption[], config?: SelectConfig);
    private init;
    private initNode;
    private initDropdown;
    private initSelectButton;
    private initSearchInput;
    private renderOptions;
    private handleSearch;
    private selectOption;
    toggle(): void;
    open(): void;
    close(): void;
    private handleOutsideClick;
    getValue(): string | undefined;
    setValue(value: string): void;
    clear(force?: boolean): void;
    updateOptions(options: ISelectOption[]): void;
    disable(): void;
    enable(): void;
    destroy(): void;
    private setButtonText;
}
export {};
