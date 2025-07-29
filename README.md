# docusaurus-twoslash

A Docusaurus plugin that adds TypeScript Twoslash integration for enhanced code blocks with
interactive type information.

[![npm version](https://badge.fury.io/js/docusaurus-twoslash.svg)](https://badge.fury.io/js/docusaurus-twoslash)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✅ **Hover tooltips** with TypeScript type information
- ✅ **Error highlighting** for TypeScript errors
- ✅ **Enhanced syntax highlighting** for code blocks
- ✅ **Dark/light mode support** with automatic theme detection
- ✅ **No impact on regular code blocks** - only processes blocks with `twoslash` meta
- ✅ **Multiple language support** - TypeScript, JavaScript, JSX, TSX
- ✅ **Configurable compiler options** for custom TypeScript setups
- ✅ **Performance optimized** with caching support

## Installation

```bash
npm install docusaurus-twoslash
# or
yarn add docusaurus-twoslash
# or
pnpm add docusaurus-twoslash
```

## Quick Start

### 1. Add the plugin to your Docusaurus config

```javascript
// docusaurus.config.js
module.exports = {
  // ... other config
  plugins: [
    "docusaurus-twoslash",
    // or with options:
    [
      "docusaurus-twoslash",
      {
        typescript: {
          compilerOptions: {
            strict: true,
          },
        },
      },
    ],
  ],
};
```

### 2. Use Twoslash in your code blocks

Add `twoslash` to your code block meta to enable type information:

````markdown
```typescript twoslash
const message = "Hello, World!";
//    ^?

const add = (a: number, b: number) => a + b;
const result = add(5, 3);
//    ^?
```
````

## Configuration

The plugin accepts the following options:

```typescript
interface TwoslashPluginOptions {
  typescript?: {
    compilerOptions?: import("typescript").CompilerOptions;
  };
  themes?: string[];
  cache?: boolean;
  includeDefaultLib?: boolean;
}
```

### Configuration Options

| Option                       | Type              | Default                                      | Description                                 |
| ---------------------------- | ----------------- | -------------------------------------------- | ------------------------------------------- |
| `typescript.compilerOptions` | `CompilerOptions` | See below                                    | Custom TypeScript compiler options          |
| `themes`                     | `string[]`        | `['typescript', 'javascript', 'jsx', 'tsx']` | Supported languages for Twoslash processing |
| `cache`                      | `boolean`         | `true`                                       | Enable caching for better performance       |
| `includeDefaultLib`          | `boolean`         | `true`                                       | Include TypeScript default library          |

### Default Compiler Options

```javascript
{
  allowJs: true,
  target: "esnext",
  module: "esnext",
  lib: ["esnext", "dom"],
  moduleResolution: "node",
  strict: false,
  esModuleInterop: true,
  skipLibCheck: true,
  declaration: false,
  allowSyntheticDefaultImports: true,
  isolatedModules: false,
  noEmit: true,
}
```

## Usage Examples

### Basic Type Inference

````markdown
```typescript twoslash
const userName = "Alice";
//    ^?

const userAge = 30;
//    ^?
```
````

### Function Return Types

````markdown
```typescript twoslash
function calculateTotal(items: { price: number }[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

const total = calculateTotal([{ price: 10 }, { price: 20 }]);
//    ^?
```
````

### Error Highlighting

````markdown
```typescript twoslash
// @errors: 2322
const message: string = 42;
```
````

### Custom Compiler Options Example

```javascript
// docusaurus.config.js
module.exports = {
  plugins: [
    [
      "docusaurus-twoslash",
      {
        typescript: {
          compilerOptions: {
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
            lib: ["es2022", "dom"],
          },
        },
        themes: ["typescript", "tsx"], // Only process TS and TSX
        cache: true,
      },
    ],
  ],
};
```

## Magic Comments

Twoslash supports several magic comments for advanced usage:

- `^?` - Show type information for the token above
- `@errors: <code>` - Expect specific TypeScript errors

Example:

````markdown
```typescript twoslash
// @errors: 2322 2345
const invalidAssignment: string = 42;
const anotherError = someUndefinedVariable;

const validCode = "This works fine";
//    ^?
```
````

## Supported Languages

- `typescript` - TypeScript files
- `javascript` - JavaScript files (with TypeScript checking)
- `jsx` - React JSX files
- `tsx` - TypeScript React files

## Styling Customization

The plugin includes CSS classes you can customize:

```css
/* Hover effect for twoslash elements */
.token.twoslash-hover:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Tooltip styling */
.twoslash-tooltip {
  background-color: var(--ifm-background-color);
  border: 1px solid var(--ifm-color-emphasis-300);
  /* ... customize as needed */
}

/* Error styling */
.twoslash-block .token.error {
  background-color: rgba(255, 0, 0, 0.1);
  text-decoration: underline wavy red;
}
```

## Performance Considerations

- **Caching**: Enable caching (default: true) for better build performance
- **Selective Processing**: Only code blocks with `twoslash` meta are processed
- **Lazy Loading**: TypeScript compiler is loaded only when needed
- **Error Handling**: Graceful fallbacks prevent build failures

## Troubleshooting

### Common Issues

**1. Types not showing up**

- Ensure your code block has the `twoslash` meta: ` ```typescript twoslash`
- Check that the language is supported (`typescript`, `javascript`, `jsx`, `tsx`)
- Verify TypeScript is properly installed

**2. Build errors**

- Check your TypeScript compiler options in the plugin config
- Ensure your code examples are syntactically correct
- Use `@errors:` comments for intentionally broken examples

**3. Performance issues**

- Enable caching in plugin options (enabled by default)
- Limit the number of languages processed via the `themes` option
- Consider using fewer Twoslash blocks per page

### Debug Mode

Enable detailed logging by setting the environment variable:

```bash
DEBUG=docusaurus-twoslash npm run build
```

## Migration from Custom Implementation

If you're migrating from a custom Twoslash implementation:

1. Remove your custom remark plugin and theme components
2. Install `docusaurus-twoslash`
3. Add the plugin to your Docusaurus config
4. Your existing `twoslash` code blocks should work without changes

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Web3Auth Team](https://github.com/web3auth)

## Related Projects

- [@typescript/twoslash](https://github.com/microsoft/TypeScript-Website/tree/v2/packages/ts-twoslash) -
  The core Twoslash implementation
- [Docusaurus](https://docusaurus.io/) - The documentation platform this plugin extends
