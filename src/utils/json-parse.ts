export function isParsableString(input: unknown): input is string {
  return typeof input === 'string' && input.trim().length > 0;
}

export function jsonParse<T>(
  maybeParsableObject: unknown,
  reviver?: (this: any, key: string, value: any) => any,
): {
  err?: Error;
  value?: T;
} {
  try {
    if (!isParsableString(maybeParsableObject)) {
      return {err: new Error('Input is not a string')};
    }

    const value = JSON.parse(maybeParsableObject) as T;

    return {value};
  } catch (error) {
    return {err: error as Error};
  }
}

export function jsonParseDeep(
  object: Record<string, unknown>,
): Record<string, unknown> {
  for (const key in object) {
    if (!Object.hasOwn(object, key)) continue;

    const value = object[key];

    if (isParsableString(value)) {
      const parsed = jsonParse(value.trim());
      if (!parsed.err) {
        object[key] = parsed.value;

        // recursively parse nested objects/arrays
        if (object[key] && typeof object[key] === 'object') {
          // eslint-disable-next-line max-depth
          if (Array.isArray(object[key])) {
            object[key] = (object[key] as unknown[]).map((item) =>
              item && typeof item === 'object'
                ? jsonParseDeep(item as Record<string, unknown>)
                : item,
            ) as unknown;
          } else {
            object[key] = jsonParseDeep(object[key] as Record<string, unknown>);
          }
        }
      }
    } else if (value && typeof value === 'object') {
      // recursively parse nested objects/arrays
      if (Array.isArray(value)) {
        object[key] = (value as unknown[]).map((item) =>
          item && typeof item === 'object'
            ? jsonParseDeep(item as Record<string, unknown>)
            : item,
        ) as unknown;
      } else {
        object[key] = jsonParseDeep(value as Record<string, unknown>);
      }
    }
  }

  return object;
}
