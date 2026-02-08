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

You can map a single formatter to multiple keys using either commas (`,`) or pipes (`|`). Dot notation works for both. Do **not** mix `,` and `|` in the same formatter key.

- `|` (take one): evaluate keys in order and format the first one that exists, then stop.
- `,` (take all): evaluate every listed key and format each one in order.

```javascript
// Take one: stop after the first matching value for each formatter key
const lineFormatter = logLineFactory({
  format: {
    "foo|baz": (value) => `!${value}`,
    "nested.a|other.a": (value) => `:${value}:`,
  },
});

console.log(
  lineFormatter(
    JSON.stringify({
      foo: "bar",
      baz: "buz",
      nested: { a: "x", b: "y" },
      other: { a: "z" },
    }),
  ),
);
// => !bar :x:
//    {"baz":"buz","nested":{"b":"y"},"other":{}}

// Take all: format every listed key
const takeAllFormatter = logLineFactory({
  format: {
    "foo,baz": (value) => `!${value}`,
    "nested.a,other.a": (value) => `:${value}:`,
  },
});

console.log(
  takeAllFormatter(
    JSON.stringify({
      foo: "bar",
      baz: "buz",
      nested: { a: "x", b: "y" },
      other: { a: "z" },
    }),
  ),
);
// => !bar !buz :x: :z:
//    {"nested":{"b":"y"},"other":{}}
```

### include

`string[]`

An array of object keys to include. Overrides excludes. All keys are included by default.

Example (include overrides exclude):

```javascript
// include wins over exclude: only nested.field will be pulled out
const formatter = logLineFactory({
  include: ['nested.field'],
  exclude: ['nested'],
  format: {
    'nested.field': (v) => `:${v}:\n`,
    part1: (v) => `[${v}]`,
  },
});

const log = JSON.stringify({
  nested: { field: 'FIELD', other: 'something' },
  part1: 'hello',
  part2: 'world',
});

console.log(formatter(log));
// => [hello] :FIELD:
//    {"part2":"world","nested":{"other":"something"}}
```

### exclude

`string[]`

An array of object keys to exclude. The keys can be nested. Can be overridden with a more deeply nested include.

Example (excluding keys and nested keys):

```javascript
// exclude top-level or nested keys from the output and extraFields
const formatter = logLineFactory({
  exclude: ['sensitive', 'meta.trace'],
  format: {
    message: (v) => v + '\n',
  },
});

const log = JSON.stringify({
  message: 'primary',
  sensitive: 'secret',
  meta: { trace: 'lots', id: 1 },
  other: 'ok',
});

console.log(formatter(log));
// => primary
//    {"other":"ok","meta":{"id":1}}
```

### parseDeep

`boolean` (default: `false`)

When enabled, the formatter will attempt to deeply parse string values that are themselves JSON. This is useful when logs include JSON-stringified fields (for example, a `details` field that contains a JSON string). The parser will recursively parse nested JSON strings inside objects and arrays and replace them with their parsed counterparts.

Notes:

- Disabled by default for performance — parsing every string can be expensive.
- Non-JSON strings are left untouched.

Example:

```typescript
const logLine = logLineFactory({
  parseDeep: true,
  format: {
    message: (v) => v + '\n',
  },
});

const input = JSON.stringify({
  message: 'primary',
  details: JSON.stringify({foo: 'bar', nested: JSON.stringify({baz: 'qux'})}),
});

console.log(logLine(input));
// =>
// primary
// {"details":{"foo":"bar","nested":{"baz":"qux"}}}

// without parseDeep
// primary
// {"details":"{\\"foo\\": \\"bar\\", \\"nested\\": {\\"baz\\":\\"qux\\"}}}\n'"
```
