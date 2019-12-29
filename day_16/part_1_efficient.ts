import { testB as signal } from './signals';
import { applyPatternEfficiently } from './util';

const PHASES = 100;

const main = () => {
  let lastSignal = [...signal];

  for (let phase = 1; phase <= PHASES; phase++) {
    const currentSignal = [...lastSignal];
    lastSignal = applyPatternEfficiently(currentSignal, 0);
  }

  console.log(`Message after ${PHASES} phases: ${lastSignal.join('')}`);
};

main();
