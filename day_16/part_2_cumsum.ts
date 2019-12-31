import { reverse, flatten } from 'lodash';
import { final as signal } from './signals';

const PHASE = 100;

const main = () => {
  const offset = parseInt(signal.slice(0, 7).join(''), 10);

  let curSignal = reverse(flatten(
    Array.from(
      new Array(10_000)
    ).map(() => [...signal])
  ).slice(offset));

  for (let p = 0; p < PHASE; p++) {
    curSignal = curSignal.map(cumulativeSummer());
  }

  console.log(`Message: ${reverse(curSignal).slice(0, 8).join('')}`);
};

const cumulativeSummer = () => ((sum: number) => (value: number) => sum = (sum + value) % 10)(0);

main();
