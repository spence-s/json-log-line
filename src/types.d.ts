declare module 'fast-json-parse' {
  function Parse<V extends Record<string, unknown> = Record<string, unknown>>(
    data: string,
  ): {
    err?: Error;
    value?: V;
  };

  export = Parse;
}
