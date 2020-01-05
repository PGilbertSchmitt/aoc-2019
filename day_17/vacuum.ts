import { channel, take, put, Channel } from '@paybase/csp';
// import { chunk, findIndex } from 'lodash';
import IntcodeCPU from '../tools/intcode_cpu_csp';
import { program } from './program';
import {  } from '../tools/timeout_wrapper';
// import { Vector2 } from '../tools/vectors';

export enum Ascii {
  LF = 10,     // \n
  POUND = 35,  // #
  DOT = 46,    // .
  NORTH = 94,  // ^
  EAST = 62,   // >
  SOUTH = 118, // v
  WEST = 60,   // <
}

class VacuumPathfinder {
  private brain: IntcodeCPU;
  private outputChan: Channel<Ascii>;
  private inputChan: Channel<number>;

  constructor() {
    this.outputChan = channel();

    this.brain = new IntcodeCPU(program, {
      inputTimeout: -1,
      outputCB: (char: Ascii) => put(this.outputChan, char),
      inputCB: this.getInput
    });
  }

  private getInput = async () => await take(this.inputChan);

  private pullOutputs
}

export default Vacuum;
