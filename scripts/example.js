import {logLineFactory} from '../dist/src/index.js';

const options = {
  include: ['nested.field'],
  exclude: ['nested'],
  format: {
    part1: (value) => `[${value}]`,
    part2: (value) => `[${value}]`,
    'nested.field': (value) => `:${value}:\n`,
  },
};

const lineFormatter = logLineFactory(options);

const log = JSON.stringify({
  nested: {
    other: 'something',
    field: 'FIELD',
  },
  part1: 'hello',
  part2: 'world',
  some: 'extra',
  data: 'here',
});

console.log(lineFormatter(log));
