# JSON Log Line Utility

This utility is designed to take JSON and plain objects and convert them into log line strings. It's compatible with any nd JSON logger.

## Features

- **JSON and Plain Object Support**: This utility can handle both JSON and plain objects, providing flexibility in the types of data you can convert into log line strings.

- **Compatible with any nd JSON Logger**: This utility is designed to work with any nd JSON logger, making it a versatile tool for your logging needs.

## Installation

To install this utility, use the following command:

`npm install json-log-line`

## Usage

To use this utility, simply pass your JSON or plain object to the `logLineFactory` function:

```typescript
const options = {
  /**
   * The key to use for the error object. Defaults to `err`.
   */
  errorKey: "err",
  /**
   * include and exclude both take keys with dot notation
   */
  exclude: [],
  /**
   * include always overrides exclude
   */
  include: [],
  /**
   * Format functions for any given key, keys of the object are automatically included and cannot be excluded
   * You can use dot notation as the object keys. The keys will print in order.
   */
  format: {
    some: (obj: any) => {
      return obj["some-key"].toString();
    },
    part: (obj: any) => {
      return obj["some-key"].toString();
    },
    of: (obj: any) => {
      return obj["some-key"].toString();
    },
    log: (obj: any) => {
      return obj["some-key"].toString();
    },
  },
};

export const lineFormatter = logLineFactory(yourObject);
```

This will return a formatter that can process strings or object output from any nd JSON logger.

example:

```javascript
import { logLineFactory } from "json-log-line";

const options = {
  include: ["nested.field"],
  exclude: ["nested"],
  format: {
    part1: (value) => `[${value}]`,
    part2: (value) => `[${value}]`,
    "nested.field": (value) => `:${value}:\n`,
  },
};

const lineFormatter = logLineFactory(options);

const log = JSON.stringify({
  nested: {
    other: "something",
    field: "FIELD",
  },
  part1: "hello",
  part2: "world",
  some: "extra",
  data: "here",
});

console.log(lineFormatter(log));
// =>
// [hello] [world] :FIELD:
// {"some":"extra","data":"here"}
```

Often times you will want to stream nd json logs into a function that formats each log.

## Options

### format

`Record<keyof parsed log object, () => string>`

Format is an object the represents how you want to parse the log object. It will parse in natural order of the object.

#### format.extraFields

A special key that contains the rest of the log object fields which were both included and not formatted by a format function.

#### Multi keys

You can map a single formatter to multiple keys by separating them with a pipe (`|`). Each key is resolved independently (dot notation is supported) and rendered in order. Every matched value is passed through the same formatter, and each consumed key is removed from the remaining `extraFields` payload.

```javascript
const lineFormatter = logLineFactory({
  format: {
    // Applies to both top-level keys
    'foo|baz': (value) => `!${value}`,
    // Works with nested keys, too
    'nested.a|other.a': (value) => `:${value}:`,
  },
});

console.log(
  lineFormatter(
    JSON.stringify({
      foo: 'bar',
      baz: 'buz',
      nested: {a: 'x', b: 'y'},
      other: {a: 'z'},
    }),
  ),
);
// => !bar !buz :x: :z:
//    {"nested":{"b":"y"},"other":{}}
```

### include

`string[]`

An array of object keys to include. Overrides excludes. All keys are included by default.

### exclude

`string[]`

An array of object keys to exclude. The keys can be nested. Can be overridden with a more deeply nested include.
