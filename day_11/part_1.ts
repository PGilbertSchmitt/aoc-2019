import { channel, take, put, select, alts } from '@paybase/csp';
import BugBot from './bug';
import IntcodeCPU from '../tools/intcode_cpu_complete';

import { final } from './program';

const main = async (program: number[]) => {
  const inputChan = channel<number>();
  const outputChan = channel<number>();
  const doneChan = channel<number>();

  const passInput = async () => {
    return await take(inputChan);
  };

  const getOutput = async (val: number) => {
    await put(outputChan, val);
  };

  // Doing this with a closure feels dirty
  // let finished = false;
  const onFinish = async (_val: number) => {
    console.log('Sending finish signal');
    await put(doneChan, _val);
    // finished = true;
  };

  const cpu = new IntcodeCPU(program, {
    inputCB: passInput,
    outputCB: getOutput,
    finishedCB: onFinish,
  });

  cpu.load();

  const bug = new BugBot();

  console.log('Starting crawl');
  cpu.exec().then(() => console.log(Array.from(bug.getHull().keys()).length));

  while (true) {
    // First, pass the bug's camera data to the computer
    const color = bug.getColor();
    await put(inputChan, color);

    // Then, get the paint color (or finish)
    // If finished channel outputs first, done = 1
    const paint = await take(outputChan);
    bug.setColor(paint);

    const dirVal = await take(outputChan);
    dirVal === 0 ? bug.turnCounterClockwise() : bug.turnClockwise();
    bug.moveForward();
  }
  // If this is unreachable, why does it halt???

  console.log('This still a thing?');
  // console.log(bug.getHull());
  return bug;
};

(async () => {
  try {
    console.log('Booting');
    await main(final);
  } catch (e) {
    console.log('Ugh');
  }
})();

// 2511
