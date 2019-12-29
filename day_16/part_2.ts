import { flatten } from 'lodash';
import { testE as signal } from './signals';
import { applyPatternEfficiently } from './util';

const PHASES = 100;

const main = () => {
  let trueSignal = flatten(
    Array.from(
      new Array(10000)
    ).map(() => [...signal])
  );
  
  const offset = parseInt(signal.slice(0,7).join(''), 10);
  trueSignal = trueSignal.slice(offset);
  
  let lastSignal = [...trueSignal];
  for (let phase = 0; phase < PHASES; phase++) {
    const currentSignal = [...lastSignal];
    lastSignal = applyPatternEfficiently(currentSignal, offset);
  }

  console.log(`Message after ${PHASES} phases: ${lastSignal.slice(0,8).join('')}`);
  console.log('done');
};

main();
