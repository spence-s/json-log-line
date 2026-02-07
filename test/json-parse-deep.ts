/* eslint-disable unicorn/prefer-structured-clone */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import test from 'ava';
import {jsonParseDeep} from '../src/utils/json-parse.ts';

test('jsonParseDeep parses nested JSON strings', (t) => {
  const input = {
    details: JSON.stringify({
      foo: 'bar',
      nested: JSON.stringify({baz: 'qux'}),
    }),
  };

  const expected = {
    details: {foo: 'bar', nested: {baz: 'qux'}},
  };

  const result = jsonParseDeep(JSON.parse(JSON.stringify(input)));
  t.deepEqual(result, expected);
});

test('jsonParseDeep parses arrays and nested objects', (t) => {
  const input = {
    object: {
      one: JSON.stringify({two: 'three'}),
      four: 'five',
      six: JSON.stringify({seven: 'eight'}),
    },
    arr: JSON.stringify([
      {one: JSON.stringify({two: 'three'})},
      {four: 'five', six: JSON.stringify({seven: 'eight'})},
    ]),
  };

  const expected = {
    object: {one: {two: 'three'}, four: 'five', six: {seven: 'eight'}},
    arr: [{one: {two: 'three'}}, {four: 'five', six: {seven: 'eight'}}],
  };

  const result = jsonParseDeep(JSON.parse(JSON.stringify(input)));
  t.deepEqual(result, expected);
});

test('jsonParseDeep leaves non-json and empty strings untouched', (t) => {
  const input = {
    a: 'not json',
    b: '   ',
    c: JSON.stringify('just a string'),
  };

  const result = jsonParseDeep(JSON.parse(JSON.stringify(input)));

  t.is(result.a, 'not json');
  t.is(result.b, '   ');
  // JSON.stringify('just a string') parses to the primitive string value
  t.is(result.c, 'just a string');
});
