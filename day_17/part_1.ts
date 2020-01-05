import { channel, drain, put } from '@paybase/csp';
import { chunk } from 'lodash';
import IntcodeCPU from '../tools/intcode_cpu_csp';
import { program } from './program';
import { Vector2 } from '../tools/vectors';

enum Ascii {
  LF = 10,
  POUND = 35,
  DOT = 46
}

const main = async () => {
  const chan = channel<number>();
  const cpu = new IntcodeCPU(program, {
    outputCB: (char: number) => put(chan, char)
  });

  cpu.load();
  await cpu.exec();

  const scaffoldStream = await drain(chan);
  const scaffoldWidth = scaffoldStream.findIndex(n => n === Ascii.LF);
  const scaffoldGrid = chunk(scaffoldStream, scaffoldWidth + 1);

  const alignParam = (i: number, j: number) => {
    const char = scaffoldGrid[j][i];

    if (char !== Ascii.POUND) {
      return 0;
    }

    const point = new Vector2(i, j)
    const neighbors = point
      .neighbors()
      .map(vec => scaffoldGrid[vec.y][vec.x])
      .filter(ch => ch === Ascii.POUND);
    return neighbors.length === 4 ? i * j : 0;
  };

  let totalAlignmentSum = 0;
  for (let i = 1; i < scaffoldWidth - 1; i++) {
    for (let j = 1; j < scaffoldGrid.length - 1; j++) {
      totalAlignmentSum += alignParam(i, j);
    }
  }

  console.log(totalAlignmentSum);
};

main();
