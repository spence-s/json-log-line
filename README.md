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
