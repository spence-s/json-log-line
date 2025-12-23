// eslint-disable-next-line @typescript-eslint/no-restricted-types
function isObject(input: unknown): input is object {
  return Boolean(
    input && Object.prototype.toString.apply(input) === '[object Object]',
  );
}

export default isObject;
