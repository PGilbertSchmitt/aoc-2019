import { testB as signal } from './signals';
import { applyPattern, getPattern } from './util';

const PHASES = 100;

const main = () => {
  let lastSignal = [...signal];
  
  // Precalculate all patterns at the beginning
  const allPatterns: number[][] = [];
  for (let i = 0; i < signal.length; i++) {
    allPatterns.push(getPattern(i + 1, signal.length));
  }

  for (let phase = 1; phase <= PHASES; phase++) {
    const currentSignal = [...lastSignal];
    lastSignal = applyPattern(currentSignal, allPatterns);
  }

  console.log(`Message after ${PHASES} phases: ${lastSignal.join('')}`);
};

main();
