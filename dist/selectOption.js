export class SelectOption {
    constructor(value, label, disabled, selected) {
        this.value = value;
        this.label = label;
        this.disabled = disabled;
        this.selected = selected;
    }
    static fromObject(option) {
        var _a, _b;
        return new SelectOption(option.value, option.label, (_a = option.disabled) !== null && _a !== void 0 ? _a : false, (_b = option.selected) !== null && _b !== void 0 ? _b : false);
    }
    static fromOption(option) {
        return new SelectOption(option.value, option.innerText, option.disabled, option.selected);
    }
}
