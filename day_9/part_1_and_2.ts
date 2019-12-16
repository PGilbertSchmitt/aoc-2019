/* --- Day 9: Sensor Boost--- */

import IntcodeCPU from '../tools/intcode_cpu_v4';
import getProgram, { Test } from './programs-1';

const main = (test: Test) => {
  const cpu = new IntcodeCPU(getProgram(test));
  cpu.load();
  cpu.exec();
};

// Pass input `1` for day 1 and `2` for day 2
main(Test.FINAL);
