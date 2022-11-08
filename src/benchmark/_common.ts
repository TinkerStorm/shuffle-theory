import benchmark from 'benchmark';
import logger from '../util/logger';

const suite = new benchmark.Suite();

suite.on('cycle', (event: Event) => {
  console.log(String(event.target));
});

suite.on('complete', function () {
  console.log('Fastest is ' + suite.filter('fastest').map('name'));
});

export function add(name: string, fn: () => void) {
  suite.add(name, fn);
}

export function run() {
  suite.run({ async: false });
}

logger.setEnabled(false);
