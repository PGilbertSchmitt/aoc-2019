import { channel, drain, put } from '@paybase/csp';
import { chunk, findIndex } from 'lodash';
import IntcodeCPU from '../tools/intcode_cpu_csp';
import { program } from './program';
import { Vector2 } from '../tools/vectors';

const main = async () => {
  const chan = channel<number>();
  const cpu = new IntcodeCPU(program, {
    outputCB: (char: number) => put(chan, char)
  });

  cpu.load([[0, 2]]);
  await cpu.exec();

  const scaffoldStream = await drain(chan);
  const scaffoldMap = new Map<string, Ascii>();
  
  let colNum = 0;
  let rowNum = 0;
  let start: Vector2;
  scaffoldStream.forEach(char => {
    if (char === Ascii.LF) {
      colNum = 0;
      rowNum++;
    } else {
      const vec = new Vector2(colNum, rowNum);
      scaffoldMap.set(vec.toString(), char);

      if (char === Ascii.NORTH || char === Ascii.EAST || char === Ascii.SOUTH || char === Ascii.WEST) {
        start = vec;
      }
    }
  });

  
};

main();
