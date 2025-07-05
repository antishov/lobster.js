# 🦞 Lobster.js

[🌐 Live Examples](https://antishov.github.io/lobster.js/examples/)

A minimalist, cross-browser custom select component built with TypeScript and SCSS.

## Features

- 🎨 Minimalist design
- 📱 Cross-browser compatibility
- 🔍 Optional search functionality
- ⌨️ Keyboard navigation support
- 🎯 Customizable options
- 🎭 Disabled state support
- 🧹 Clearable option
- 🔒 Type-safe events
- 🌗 Dark mode support

## Installation

```bash
npm install lobster.js
```

## Usage

### Basic Usage

```html
<!-- Both variants are acceptable: -->

<!-- Init over div element -->
<div id="my-select"></div>

<!-- Init over select element -->
<select id="my-select">
  <option value="1">Option 1</option>
  <option value="2" disabled>Option 2</option>
  <option value="3" selected>Option 3</option>
</select>
```

```typescript
import { Select } from "lobster.js";
import "lobster.js/dist/styles/lobster.css";

// [PLEASE NOTICE] In case of targeting HTMLSelectElement its options would be overwritten by these values. Leave options array empty if you don't want to overwrite them
const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2", selected: true },
  { value: "3", label: "Option 3", disabled: true },
];

const select = new Select("#my-select", options, {
  placeholder: "Select an option",
});

// Listen for changes with type safety
select.container.addEventListener("change", (event: SelectChangeEvent) => {
  const { value, label } = event.detail;
  console.log("Selected:", { value, label });
});
```

### With Search

```typescript
const select = new Select("#my-select", options, {
  placeholder: "Select an option",
  searchable: true,
});
```

### Clearable Select

```typescript
const select = new Select("#my-select", options, {
  placeholder: "Select an option",
  clearable: true,
});

// Clear the selection
select.clear();
```

### API Methods

```typescript
// Get current value
const value = select.getValue();

// Set value programmatically
select.setValue("2");

// Update options
select.updateOptions([{ value: "4", label: "New Option" }]);

// Disable/Enable
select.disable();
select.enable();

// Destroy component
select.destroy();
```

### Event Handling

```typescript
// Type-safe event handling
select.container.addEventListener("change", (event: SelectChangeEvent) => {
  const { value, label } = event.detail;
  console.log(`Selected option: ${label} with value: ${value}`);
});
```

## Styling

The component comes with a default minimalist theme and automatically supports dark mode based on system preferences. You can override the default styles by targeting the following classes:

- `.lobster-select` - Main container
- `.lobster-select__button` - Select button
- `.lobster-select__dropdown` - Dropdown container
- `.lobster-select__option` - Option item
- `.lobster-select__search` - Search input container
- `.lobster-select__search-input` - Search input
- `.lobster-select__shadow-node` - Shadow select element

### Custom Styling Example

```scss
// Override light theme variables
:root {
  --lobster-primary: #2563eb;
  --lobster-primary-alpha: rgba(37, 99, 235, 0.1);
  --lobster-primary-alpha-hover: rgba(37, 99, 235, 0.15);
  --lobster-border: #e5e7eb;
  --lobster-text: #374151;
  --lobster-disabled: #9ca3af;
  --lobster-background: #ffffff;
  --lobster-hover: #f3f4f6;
  --lobster-shadow: rgba(0, 0, 0, 0.1);
}

// Override dark theme variables
@media (prefers-color-scheme: dark) {
  :root {
    --lobster-primary: #60a5fa;
    --lobster-primary-alpha: rgba(96, 165, 250, 0.1);
    --lobster-primary-alpha-hover: rgba(96, 165, 250, 0.15);
    --lobster-border: #374151;
    --lobster-text: #e5e7eb;
    --lobster-disabled: #6b7280;
    --lobster-background: #1f2937;
    --lobster-hover: #374151;
    --lobster-shadow: rgba(0, 0, 0, 0.25);
  }
}

// Additional custom styles
.lobster-select {
  // Your custom styles
  &__button {
    // Custom button styles
  }

  &__option {
    // Custom option styles
  }
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11 (with polyfills)

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development mode:
   ```bash
   npm run dev
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Run tests:
   ```bash
   npm test
   ```

## License

MIT
