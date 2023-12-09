import test from 'ava';
import defaultCreateLogLine, {createLogLine} from '../src/index.ts';

test('is a function', (t) => {
  t.is(typeof createLogLine, 'function');
  t.is(typeof defaultCreateLogLine, 'function');
});

test('returns the original JSON stringified string if no formatters are provided', (t) => {
  const logLine = createLogLine();
  const input = JSON.stringify({foo: 'bar'});
  t.is(logLine(input), '\n' + input + '\n');
});

test('returns the JSON stringified object if an object is the input', (t) => {
  const logLine = createLogLine();
  const input = {foo: 'bar'};
  const stringified = JSON.stringify(input);
  t.is(logLine(input), '\n' + stringified + '\n');
});

test('creates a simple log line', (t) => {
  const input = JSON.stringify({foo: 'bar'});
  const format = {
    foo: (value: string) => value,
  };
  const logLine = createLogLine({format});
  t.is(logLine(input), 'bar\n');
});

test('creates a simple log line with default extra fields', (t) => {
  const input = JSON.stringify({foo: 'bar', extra: 'baz'});
  const format = {
    foo: (value: string) => value,
  };
  const logLine = createLogLine({format});
  t.is(logLine(input), 'bar\n{"extra":"baz"}\n');
});

test('creates a simple log line with formatted extra fields', (t) => {
  const input = JSON.stringify({foo: 'bar', extra: 'baz'});
  const format = {
    foo: (value: string) => value + '\n',
    extraFields: (value: any) => JSON.stringify(value, null, 2),
  };
  const logLine = createLogLine({format});
  t.is(
    logLine(input),
    'bar\n' + JSON.stringify({extra: 'baz'}, null, 2) + '\n',
  );
});

test('nested fields can be added to log line and removed from extra fields', (t) => {
  const input = JSON.stringify({foo: {bar: 'baz'}});
  const format = {
    'foo.bar': (value: string) => value,
  };
  const logLine = createLogLine({format});
  t.is(logLine(input), 'baz\n{"foo":{}}\n');
});

test('nested respect exlude and include', (t) => {
  const input = JSON.stringify({foo: {bar: 'baz', biz: 'buz', no: 'output'}});
  const format = {
    'foo.bar': (value: string) => value,
  };
  const logLine = createLogLine({
    format,
    exclude: ['foo'],
    include: ['foo.biz'],
  });
  t.is(logLine(input), 'baz\n{"foo":{"biz":"buz"}}\n');
});
