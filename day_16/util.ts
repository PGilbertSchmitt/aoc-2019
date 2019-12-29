import { flatten } from 'lodash';

const DEFAULT_PATTERN = [0, 1, 0, -1];

// Requires a minimum iteration of 1
export const getPattern = (iter: number, patternLength: number) => {
  let pattern = flatten(DEFAULT_PATTERN.map(num =>
    Array.from(new Array(iter)).map(() => num)
  ));

  while (pattern.length < patternLength + 1) {
    pattern = pattern.concat(pattern);
  }

  // Remove first element, then
  return pattern.slice(1).slice(0, patternLength);
};

export const applyPattern = (signal: number[], allPatterns: number[][]) =>
  signal.map((_, i) => {
    const pattern = allPatterns[i];
    const result = Math.abs(
      signal.map((s, j) => s * pattern[j])
            .reduce((a, b) => a + b, 0)
    ) % 10;
    return result;
  });

const getPatternValue = (depth: number, idx: number): number => {
  const truIdx = Math.floor((idx + 1) / (depth + 1));
  // console.log(depth, idx, truIdx % 4);
  return DEFAULT_PATTERN[truIdx % 4];
};

export const applyPatternEfficiently = (signal: number[], offset: number) => {
  const nextSignal = new Array(signal.length);
  for (let i = 0; i < signal.length; i++) {
    let sum = 0;
    for (let j = i; j < signal.length; j++) {
      sum += signal[j] * getPatternValue(i, j + offset);
    }
    nextSignal[i] = Math.abs(sum) % 10;
  }
  return nextSignal;
};

  // signal.map((_, i) => {
  //   const pattern = getPatternValue(i);
  //   const result = Math.abs(
  //     signal.map((s, j) => s * pattern(j))
  //           .reduce((a, b) => a + b, 0)
  //   ) % 10;
  //   return result;
  // });