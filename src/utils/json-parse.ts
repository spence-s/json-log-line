import isObject from './is-object.ts';

export function isDeepParsable(
  input: unknown,
): input is Record<string, unknown> | unknown[] {
  return (isObject(input) || Array.isArray(input)) && input !== null;
}

export function isParsableString(input: unknown): input is string {
  return (
    typeof input === 'string' &&
    input.trim().length > 0 &&
    (input.trim().endsWith('}') || input.trim().startsWith('['))
  );
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

    const value = JSON.parse(maybeParsableObject, reviver) as T;

    return {value};
  } catch (error) {
    return {err: error as Error};
  }
}

export function jsonParseDeep(object: string): Record<string, unknown> | unknown[] | string; // eslint-disable-line prettier/prettier
export function jsonParseDeep(object: unknown[]): unknown[];
export function jsonParseDeep(object: Record<string, unknown>): Record<string, unknown>; // eslint-disable-line prettier/prettier
export function jsonParseDeep<T>(object: T): T;
export function jsonParseDeep(object: unknown) {
  if (isParsableString(object)) {
    const parsed = jsonParse<Record<string, unknown> | unknown[]>(object);

    if (!parsed.err && parsed.value) {
      return jsonParseDeep(parsed.value);
    }

    // If parsing fails, return the original string
    return object;
  }

  if (!isDeepParsable(object)) {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map((item) => jsonParseDeep(item));
  }

  for (const key in object) {
    if (!Object.hasOwn(object, key)) continue;

    const value = object[key];

    object[key] = jsonParseDeep(value);
  }

  return object;
}
