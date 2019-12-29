import { Channel, channel, take, put } from '@paybase/csp';
import { keyIn } from 'readline-sync';
import IntcodeCPU from '../tools/intcode_cpu_csp';
import { program } from './program';

enum Status {
  KILL = -1,
  HIT_WALL = 0,
  MOVED = 1,
  FOUND_OXYGEN = 2
}

class Droid {
  private brain: IntcodeCPU;
  private statusQueue: Channel<Status>;

  constructor() {
    this.statusQueue = channel();
    const getInput = this.getUserInput;

    this.brain = new IntcodeCPU(program, {
      inputTimeout: -1,
      inputCB: getInput,
      outputCB: (status: Status) => put(this.statusQueue, status)
    });
  }

  public async start() {
    this.brain.exec();

    while (true) {
      const status = await take(this.statusQueue);
      console.log(status);
      // Update map here

      if (status === Status.KILL) {
        break;
      }
    }
  }

  private async getUserInput() {
    // Print map here

    const key = keyIn(undefined, {
      limit: 'wasdk'
    });

    switch (key) {
      case 'w':
        return 1;
      case 's':
        return 2;
      case 'a':
        return 3;
      case 'd':
        return 4;
      case 'k':
        put(this.statusQueue, Status.KILL);
        return 1;
      default:
        console.log('Thank you for your honesty');
        throw new Error('We all know that!');
    }
  }
}

export default Droid;
