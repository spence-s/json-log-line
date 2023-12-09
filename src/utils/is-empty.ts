import isObject from './is-object.js';

function isEmpty(object: unknown): object is Record<string, never> {
  return Boolean(
    isObject(object) &&
      (object === undefined ||
        object === null ||
        Object.keys(object).length === 0),
  );
}

export default isEmpty;
