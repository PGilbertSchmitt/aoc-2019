import { channel, take, put } from '@paybase/csp';
import { min, max, reverse } from 'lodash';
import BugBot, { Color, HullMap } from './bug';
import IntcodeCPU from '../tools/intcode_cpu_csp';

import { final } from './program';

const TIMEOUT = 10;

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

  const bug = new BugBot(Color.WHITE);

  console.log('Starting crawl');
  cpu.exec();

  while (true) {
    // First, pass the bug's camera data to the computer
    const color = bug.getColor();

    const received = await Promise.race([
      put(inputChan, color),
      timeout()
    ]);

    if (received === null) {
      break;
    }

    // Then, get the paint color (or finish)
    // If finished channel outputs first, done = 1
    const paint = await take(outputChan);
    bug.setColor(paint);

    const dirVal = await take(outputChan);
    dirVal === 0 ? bug.turnCounterClockwise() : bug.turnClockwise();
    bug.moveForward();
  }

  await take(doneChan);
  paintHull(bug.getHull());
  console.log('Hull painted!');
  return;
};

const paintHull = (hull: HullMap) => {
  const keys = Array.from(hull.keys());
  const keyPositions = keys.map(BugBot.strToPos);
  const xs = keyPositions.map(([x, _]) => x);
  const ys = keyPositions.map(([_, y]) => y);
  const xMin = min(xs) as number;
  const yMin = min(ys) as number;
  const xMax = max(xs) as number;
  const yMax = max(ys) as number;

  console.log(`This hull will stretch to ${xMax - xMin + 1},${yMax - yMin + 1}`);
  const hullRow: Color[] = Array.from(new Array(xMax - xMin + 1)).map(() => Color.BLACK);
  const hullImage: Color[][] = Array.from(new Array(yMax - yMin + 1)).map(() => [...hullRow]);
  for (const key of keys) {
    const [x, y] = BugBot.strToPos(key);
    hullImage[y - yMin][x - xMin] = hull.get(key) || Color.BLACK;
  }

  for (const row of reverse(hullImage)) {
    console.log(row.map(c => c === 0 ? '..' : '##').join(''));
  }
};

const timeout = () => new Promise<null>(resolve => {
  const wait = setTimeout(() => {
    clearTimeout(wait);
    resolve(null);
  }, TIMEOUT);
});

(async () => {
  try {
    console.log('Booting');
    await main(final);
    console.log('We done!');
  } catch (e) {
    console.log('Ugh');
  }
})();

// 2511
