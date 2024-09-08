import jsonParse from 'fast-json-parse';
import unset from 'unset-value';
import get from 'get-value';
import set from 'set-value';
import isObject from './utils/is-object.js';
import isEmpty from './utils/is-empty.js';

export type Options = {
  errorKey?: string;
  exclude?: string | string[];
  include?: string | string[];
  format?: Record<
    string,
    (value: any, parsedLogObject?: any, ...arguments_: any[]) => string
  >;
  logLineKeys?: string | string[];
};

type LogObject = Record<string, unknown>;

const nl = '\n';

export function logLineFactory({
  /**
   * The key to use for the error object. Defaults to `err`.
   */
  errorKey = 'err',
  /**
   * include and exclude both take keys with dot notation
   */
  exclude = [],
  /**
   * include always overrides exclude
   */
  include = [],
  /**
   * Format functions for any given key, keys of the object are automatically included and cannot be excluded
   */
  format = {},
}: Options = {}) {
  const logLineKeys = Object.keys(format);

  format.extraFields ||= (object: LogObject) => JSON.stringify(object) + nl;

  /**
   * @param inputData - The input data to be formatted can be a JSON stringified object or a plain object
   */
  return function (inputData: string | Record<string, unknown>): string {
    try {
      let object: LogObject = {};
      if (typeof inputData === 'string') {
        const parsedData = jsonParse<LogObject>(inputData);

        if (!parsedData.value || parsedData.err) {
          return inputData + nl;
        }

        object = parsedData.value;
      } else if (isObject(inputData)) {
        object = inputData;
      } else {
        return nl;
      }

      // cache the whitelist
      const whiteListObject = {};
      for (const key of [...logLineKeys, ...include]) {
        const value: unknown = get(object, key);
        if (value) {
          set(whiteListObject, key, value);
        }
      }

      // remove the blacklist
      for (const key of exclude) {
        unset(object, key);
      }

      // add back in the whitelist
      object = {
        ...object,
        ...whiteListObject,
      };

      const output: string[] = [];

      for (const key of logLineKeys) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = get(object, key);

        if (!value) {
          continue;
        }

        const formatter = format[key];

        if (formatter) {
          output.push(formatter(value, object));
        }
      }

      // remove the properties that were used to create the log-line
      for (const key of logLineKeys) {
        unset(object, key);
      }

      // remove empty blacklist that may have had whitelisted properties
      for (const key of exclude) {
        if (isEmpty(get(object, key))) {
          unset(object, key);
        }
      }

      if (object[errorKey]) {
        output.push(format.err(object[errorKey], object));
        unset(object, errorKey);
      }

      let outputString = output.filter(Boolean).join(' ');

      // after processing the rest of the object contains
      // extra fields that were not in the logLine nor in the log line nor blacklisted
      // so these are the ones we want to prettify and highlight
      if (isObject(object) && !isEmpty(object) && format.extraFields) {
        outputString = outputString.concat(format.extraFields(object));
      }

      if (!outputString.endsWith(nl)) {
        outputString += nl;
      }

      if (outputString === nl) {
        return JSON.stringify(object) + nl;
      }

      return outputString;
    } catch (error: unknown) {
      console.log(error);
      return '';
    }
  };
}
