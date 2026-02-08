import isObject from './is-object.ts';

export function isDeepParsable(
  input: any,
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

    const value = JSON.parse(maybeParsableObject) as T;

    return {value};
  } catch (error) {
    return {err: error as Error};
  }
}

export function jsonParseDeep(object: any): any {
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
    return object.map((item) => jsonParseDeep(item)); // eslint-disable-line @typescript-eslint/no-unsafe-return
  }

  for (const key in object) {
    if (!Object.hasOwn(object, key)) continue;

    const value = object[key];

    object[key] = jsonParseDeep(value);
  }

  return object;
}
