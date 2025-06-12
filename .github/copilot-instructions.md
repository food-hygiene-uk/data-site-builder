# Project Context

This project is a static website generator that creates HTML, CSS, and JavaScript for a website. The generated output is placed in a `dist` directory, which is then committed to a separate repository for deployment.

## Technology Stack

- **Server/Generator**: TypeScript files with `.mts` extension executed by Deno
- **Client Code**:
  - `.vto` - Vento template files for HTML structure
  - `.css` - Stylesheets supporting both light and dark themes
  - `.mjs` - Client-side JavaScript modules
  - Occasionally, template strings in `.mts` files may inject content into the generated site

## File Structure

- `src/` - Parent directory containing all source files
  - `generate-site.mts` - Main orchestrator file and entry point for code execution
  - `pages/` - Contains top-level page directories (no nested pages)
    - Each page has its own directory with associated files
    - Page `.mts` files extract content from `.css` and `.mjs` files and pass it to Vento templates
  - `components/` - Contains reusable components used across multiple pages

## Coding Standards

### TypeScript (`.mts` files)

- Utilize Deno API for file operations and other server-side functionality
- Only use TypeScript for type definitions
- Document all functions using JSDoc
- Do not add types where they can be derived from function return types or context
- Use specific types, never use "Object"
- Any function that returns a Promise should be marked as `async`
- Always use `globalThis` instead of `window` for accessing global objects
- Prefer arrow function expressions (`const fn = () => {}`) over function declarations (`function fn() {}`). Exceptions: generators, object methods requiring dynamic `this`
- Prefer modules to classes
- Comments should only be used to aid future readers in understanding the current state of the code. Avoid using comments to track work or highlight changes.

### JavaScript (`.mjs` files)

- Should be browser-compatible without transpilation
- Only use JSDoc for type definitions
- Document all functions using JSDoc
- Do not add types where they can be derived from function return types or context
- Use specific types, never use "Object"
- Any function that returns a Promise should be marked as `async`
- Always use `globalThis` instead of `window` for accessing global objects
- Prefer arrow function expressions (`const fn = () => {}`) over function declarations (`function fn() {}`). Exceptions: generators, object methods requiring dynamic `this`
- Prefer modules to classes
- Comments should only be used to aid future readers in understanding the current state of the code. Avoid using comments to track work or highlight changes.

### CSS

- All styles must support both light and dark modes

  - because the site allows theme preference and falls back to browser settings the components/root/styles.css file sets up the use of color-scheme.
  - Use `light-dark()` for every color in the CSS files. This function will return the correct color based on the user's preference.

- Follow the established theming patterns

### Vento Templates (`.vto` files)

- Used for HTML generation
- Can include components and page-specific content

## Testing

- Ensure that all generated HTML, CSS, and JavaScript files are tested for correctness
- For '.mts' and '.mjs' files, all tests should include example based, and property based tests
  - Use Deno's built-in testing framework for `.mts` files
  - Use browser testing tools for `.mjs` files to ensure compatibility and functionality
  - Tests should use Behavior-Driven Development (BDD) style
- Ensure that CSS files are tested for both light and dark themes
- Use Vento's testing capabilities to ensure templates render correctly with dynamic content
- Ensure that all components and pages are tested for correct integration and functionality

## Checklist for Compliance

### TypeScript (`.mts` files)

- [ ] Use specific types, never "Object"
- [ ] Document all functions with JSDoc
- [ ] Use `async` for functions returning a Promise
- [ ] Use `globalThis` for global objects
- [ ] Prefer arrow functions unless exceptions apply
- [ ] Use modules instead of classes
- [ ] Utilize Deno API for file operations and server-side functionality
- [ ] Comments should only be used to aid future readers in understanding the current state of the code. Avoid using comments to track work or highlight changes.
- [ ] Ensure there is a test file that uses both example and property based tests for all functions

### JavaScript (`.mjs` files)

- [ ] Use specific types, never "Object"
- [ ] Document all functions with JSDoc
- [ ] Use `async` for functions returning a Promise
- [ ] Use `globalThis` for global objects
- [ ] Prefer arrow functions unless exceptions apply
- [ ] Use modules instead of classes
- [ ] Ensure browser compatibility without transpilation
- [ ] Comments should only be used to aid future readers in understanding the current state of the code. Avoid using comments to track work or highlight changes.

### CSS

- [ ] Support both light and dark modes
- [ ] Use the provided media query for dark mode
- [ ] Follow established theming patterns

### Vento Templates (`.vto` files)

- [ ] Ensure templates are used for HTML generation
- [ ] Include components and page-specific content
- [ ] Ensure proper integration with `.mts` files for dynamic content injection

## Examples

### TypeScript (`.mts` files)

#### Incorrect

```typescript
/**
 * Processes a CSS file.
 * @param {Object} params - Parameters for processing CSS.
 */
const processCss = (params) => {
  // ...
};
```

#### Correct

```typescript
/**
 * Processes a CSS file.
 * @param {{ path: string; additionalCss: string }} params - Parameters for processing CSS.
 */
const processCss = ({
  path,
  additionalCss,
}: {
  path: string;
  additionalCss: string;
}) => {
  // ...
};
```
