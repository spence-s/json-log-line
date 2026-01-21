# Agent Guidelines for json-log-line

This document provides coding guidelines and conventions for AI agents working on the json-log-line codebase.

## Project Overview

A TypeScript utility for converting JSON and plain objects into formatted log line strings. Uses ESM modules and targets Node.js 22+.

## Build, Lint, and Test Commands

### Primary Commands

```bash
# Run all tests with coverage
npm test

# Run a single test file
npx ava test/create-log-line.ts

# Run specific test by name pattern
npx ava test/create-log-line.ts --match "*creates a simple log line*"

# Type check without build
npm run check

# Lint (includes type checking + xo)
npm run lint

# Auto-fix linting issues + formatting with prettier
npx xo --fix

# Build for production
npm run build

# Clean dist directory
npm run clean
```

### Pre-commit Hooks

- Husky runs lint-staged on pre-commit
- Commitlint validates commit messages using conventional commits format

## TypeScript Configuration

### Compiler Settings

- **Module system**: Node20 (native ESM)
- **Target**: ES2023
- **Strict mode**: Enabled with `noUncheckedIndexedAccess`
- **Import extensions**: Use `.ts` extensions in imports (automatically rewritten by tsc)
- **Type imports**: Use `verbatimModuleSyntax` - prefer explicit `import type` for types

### Key Rules

- All imports must include file extensions (e.g., `from './utils/is-object.ts'`)
- Use `type` keyword for type-only imports when possible
- Enable declaration files and source maps
- Skip lib checking for performance

## Code Style Guidelines

### Imports

```typescript
// ✅ Correct - explicit .ts extension
import isObject from "./utils/is-object.ts";
import type { Options } from "./types.d.ts";

// ❌ Wrong - missing extension
import isObject from "./utils/is-object";
```

### Formatting

- **Indentation**: 2 Spaces (enforced by xo)
- **Semicolons**: Required
- **Line length**: Keep reasonable (enforced and formatted by xo)
- **Quotes**: Single quotes for strings (enforced and formatted by xo)
- **Trailing commas**: Where valid

### Naming Conventions

- **Functions**: camelCase (e.g., `logLineFactory`, `isObject`)
- **Types/Interfaces**: PascalCase (e.g., `Options`, `LogObject`)
- **Constants**: camelCase (e.g., `nl`, `splitLogLineKeys`)
- **Private/internal**: Prefix with underscore (e.g., `_key`)
- **Files**: kebab-case for utilities (e.g., `is-object.ts`, `is-empty.ts`)

### Type Safety

```typescript
// ✅ Prefer explicit types
type LogObject = Record<string, unknown>;

// ✅ Use type guards
function isObject(input: unknown): input is object {
  return Boolean(
    input && Object.prototype.toString.apply(input) === "[object Object]",
  );
}

// ✅ Safe array access with noUncheckedIndexedAccess
const value: unknown = get(object, key);
if (value) {
  // safe to use value
}

// ✅ Explicit any with eslint-disable where needed
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const value = get(object, key);
```

### Error Handling

```typescript
// ✅ Catch all errors, log and return safe default
try {
  // ... processing
} catch (error: unknown) {
  console.log(error);
  return "";
}
```

### Function Style

- Use named exports (no default exports except utilities)
- Factory pattern for creating configured functions
- Pure functions where possible
- Document complex logic with comments

### Comments

```typescript
// ✅ Use JSDoc for public APIs
/**
 * @param inputData - The input data to be formatted can be a JSON stringified object or a plain object
 */

// ✅ Inline comments for complex logic
// cache the whitelist
// remove the blacklist
// add back in the whitelist
```

## Testing with AVA

### Test Structure

```typescript
import test from "ava";
import { logLineFactory } from "../src/index.ts";

test("descriptive test name", (t) => {
  // Arrange
  const input = JSON.stringify({ foo: "bar" });
  const logLine = logLineFactory();

  // Act
  const result = logLine(input);

  // Assert
  t.is(result, "bar\n");
});
```

### AVA Configuration

- Files: `test/**` (excluding fixtures and helpers)
- Extensions: `.ts`
- Verbose mode enabled
- Coverage with c8

## Git Commit Guidelines

Follow conventional commits format (enforced by commitlint):

```bash
# Format: <type>(<scope>): <subject>

# Examples:
feat: add support for array formatting
fix: handle empty nested objects correctly
docs: update usage examples
test: add tests for multikey formatters
refactor: simplify whitelist logic
chore: update dependencies
```

### Common types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding or updating tests
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `chore`: Maintenance tasks

## Common Patterns

### Optional Chaining and Nullish Coalescing

```typescript
// ✅ Use for safe access
format.extraFields ||= (object: LogObject) => JSON.stringify(object) + nl;
```

### Array Methods

```typescript
// ✅ Prefer flatMap, filter, map
const splitLogLineKeys = logLineKeys.flatMap((key) => key.split(/\||,/));
const outputString = output.filter(Boolean).join(" ");
```

### Object Manipulation

- Use `get-value` for nested property access with dot notation
- Use `set-value` for nested property setting
- Use `unset-value` for nested property removal
- Use `@fastify/deepmerge` for merging objects

## Architecture Notes

- Single entry point: `src/index.ts`
- Utilities in `src/utils/`
- Type definitions in `src/types.d.ts`
- Factory pattern creates configured log formatters
- Supports dot notation for nested properties
- Multi-key support with `|` (take-one) and `,` (take-all)
