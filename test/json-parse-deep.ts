/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

  const result = jsonParseDeep(structuredClone(input));
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

  const result = jsonParseDeep(structuredClone(input));
  t.deepEqual(result, expected);
});

test('jsonParseDeep leaves non-json, empty strings, and numeric strings untouched', (t) => {
  const input = {
    a: 'not json',
    b: '   ',
    c: JSON.stringify('just a string'),
    d: '123',
  };

  const result = jsonParseDeep(structuredClone(input));

  t.is(result.a, 'not json');
  t.is(result.b, '   ');
  // Primitive JSON strings should remain unparsed
  t.is(result.c, JSON.stringify('just a string'));
  t.is(result.d, '123');
});

test('jsonParseDeep only parses objects and arrays of objects', (t) => {
  const input = {
    count: '123',
    numericJson: JSON.stringify(123),
    stringJson: JSON.stringify('just a string'),
    arrayOfNumbers: JSON.stringify([1, 2, 3], null, 2),
    objectJson: JSON.stringify({foo: 'bar'}),
    arrayOfObjects: JSON.stringify([
      JSON.stringify({foo: 'bar'}),
      {baz: 'qux'},
    ]),
  };

  const result = jsonParseDeep(structuredClone(input));

  t.is(result.count, '123');
  t.deepEqual(result.numericJson, JSON.stringify(123));
  t.deepEqual(result.stringJson, JSON.stringify('just a string'));
  t.deepEqual(result.arrayOfNumbers, [1, 2, 3]);
  t.deepEqual(result.objectJson, {foo: 'bar'});
  t.deepEqual(result.arrayOfObjects, [{foo: 'bar'}, {baz: 'qux'}]);
});
