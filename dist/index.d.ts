interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
interface SelectConfig {
    placeholder?: string;
    searchable?: boolean;
    clearable?: boolean;
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
    private container;
    private selectButton;
    private dropdown;
    private searchInput?;
    private options;
    private selectedOption?;
    private isOpen;
    private config;
    constructor(selector: string, options?: SelectOption[], config?: SelectConfig);
    private init;
    private renderOptions;
    private handleSearch;
    private selectOption;
    private toggle;
    private open;
    private close;
    private handleOutsideClick;
    getValue(): string | undefined;
    setValue(value: string): void;
    clear(force?: boolean): void;
    updateOptions(options: SelectOption[]): void;
    disable(): void;
    enable(): void;
}
export {};
