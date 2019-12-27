/**
 * Complete version of Intcode spec, using passed
 */

import { reverse, padStart, isNil } from 'lodash';
import { questionInt } from 'readline-sync';

import { timeoutWrapper } from './timeout_wrapper';

const NOUN_INDEX = 1;
const VERB_INDEX = 2;
const MAX_OPERANDS = 3;

const TIMEOUT = 1000;

enum Ops {
  ADD = 1,
  MULT = 2,
  GET_INPUT = 3,
  SEND_OUTPUT = 4,
  JUMP_IF_TRUE = 5,
  JUMP_IF_FALSE = 6,
  LESS_THAN = 7,
  EQUAL_TO = 8,
  SET_REL = 9,
  HALT = 99
}

enum Mode {
  POSITION = 0,
  IMMEDIATE = 1,
  RELATIVE = 2,
}

interface Operator {
  code: Ops;
  modes: number[];
}

export type InputCallback = () => Promise<number>;
export type OutputCallback = (output: number) => Promise<void | null>;

const defaultInput = async () => {
  return questionInt('> ');
};

const defaultOutput = async (out: number) => {
  console.log(out);
};

export interface ICPUOptions {
  inputCB?: InputCallback;
  outputCB?: OutputCallback;
  finishedCB?: OutputCallback;
  inputTimeout?: number;
}

class IntcodeCPU {
  private program: number[];
  private code: number[] = [];
  private ip: number = 0;
  private relBase: number = 0;
  private inputCB: InputCallback;
  private outputCB: OutputCallback;
  private finishedCB: OutputCallback;

  constructor(
    program: number[],
    opts?: ICPUOptions
  ) {
    this.program = program;
    if (opts?.inputTimeout || 0 < 0) {
      this.inputCB = opts?.inputCB || defaultInput;
    } else {
      this.inputCB = timeoutWrapper(
        opts?.inputCB || defaultInput,
        opts?.inputTimeout || TIMEOUT
      );
    }
    this.outputCB = opts?.outputCB || defaultOutput;
    this.finishedCB = opts?.finishedCB || defaultOutput;
  }

  public load(overrides?: Array<[number, number]>) {
    this.ip = 0;
    this.relBase = 0;
    this.code = [...this.program];

    if (overrides && overrides.length > 0) {
      for (const [addr, val] of overrides) {
        this.code[addr] = val;
      }
    }
  }

  public async exec() {
    if (this.ip !== 0) {
      console.log('CPU must be reloaded before running');
      return 0;
    }

    let op = this.getCode();

    while (op.code && op.code !== Ops.HALT) {
      await this.step(op);
      op = this.getCode();
    }

    this.finishedCB(this.code[0]);
    return;
  }

  private async step(op: Operator) {
    switch (op.code) {
      case Ops.ADD:
        this.opAdd(op.modes);
        break;
      case Ops.MULT:
        this.opMult(op.modes);
        break;
      case Ops.GET_INPUT:
        await this.opGetInput(op.modes);
        break;
      case Ops.SEND_OUTPUT:
        this.opSendOutput(op.modes);
        break;
      case Ops.JUMP_IF_TRUE:
        this.opJump(true, op.modes);
        break;
      case Ops.JUMP_IF_FALSE:
        this.opJump(false, op.modes);
        break;
      case Ops.LESS_THAN:
        this.opLessThan(op.modes);
        break;
      case Ops.EQUAL_TO:
        this.opEqualTo(op.modes);
        break;
      case Ops.SET_REL:
        this.opSetRel(op.modes);
        break;
      default:
        throw new Error(`Unexpected op ${op.code} @ ${this.ip}`);
    }

    if ((op.code !== Ops.JUMP_IF_FALSE) && op.code !== Ops.JUMP_IF_TRUE) {
      this.pushIp(op.code);
    }
  }

  // Acquires 3 operands, then pushes the ip to the next operator
  private retrieveOperands(numOps: number): number[] {
    return this.code.slice(this.ip + 1, this.ip + numOps + 1);
  }

  private pushIp(op: number) {
    switch (op) {
      case Ops.ADD:
      case Ops.MULT:
      case Ops.LESS_THAN:
      case Ops.EQUAL_TO:
        this.ip += 4;
        break;
      case Ops.GET_INPUT:
      case Ops.SEND_OUTPUT:
      case Ops.SET_REL:
        this.ip += 2;
        break;
      // The default case here would be jumps, which handle their own ip manipulation
    }
  }

  private opAdd([aMode, bMode, cMode]: Mode[]) {
    const [a, b, c] = this.retrieveOperands(3);
    const value = this.toVal(a, aMode) + this.toVal(b, bMode);
    this.write(c, cMode, value);
  }

  private opMult([aMode, bMode, cMode]: Mode[]) {
    const [a, b, c] = this.retrieveOperands(3);
    const value = this.toVal(a, aMode) * this.toVal(b, bMode);
    this.write(c, cMode, value);
  }

  // Inputs
  private async opGetInput([aMode]: Mode[]) {
    const codeIp = this.ip;
    const [a] = this.retrieveOperands(1);
    const input = await this.inputCB();
    if (input === null) {
      throw new Error('Waited for input for too long');
    }
    this.write(a, aMode, input);
  }

  // Outputs
  private opSendOutput([aMode]: Mode[]) {
    const codeIp = this.ip;
    const [a] = this.retrieveOperands(1);
    const value = this.toVal(a, aMode);
    // May be async, but the return is void so no reason to pause
    this.outputCB(value);
  }

  private opJump(isTrue: boolean, [aMode, bMode]: Mode[]) {
    const [a, b] = this.retrieveOperands(2);
    const newIp = this.toVal(b, bMode);
    if (this.toVal(a, aMode) === 0) {
      this.ip = isTrue ? (this.ip + 3) : newIp;
    } else {
      this.ip = !isTrue ? (this.ip + 3) : newIp;
    }
  }

  private opLessThan([aMode, bMode, cMode]: Mode[]) {
    const [a, b, c] = this.retrieveOperands(3);
    const value = this.toVal(a, aMode) < this.toVal(b, bMode) ? 1 : 0;
    this.write(c, cMode, value);
  }

  private opEqualTo([aMode, bMode, cMode]: Mode[]) {
    const [a, b, c] = this.retrieveOperands(3);
    const value = this.toVal(a, aMode) === this.toVal(b, bMode) ? 1 : 0;
    this.write(c, cMode, value);
  }

  private opSetRel([aMode]: Mode[]) {
    const [a] = this.retrieveOperands(1);
    this.relBase += this.toVal(a, aMode);
  }

  private getCode(): Operator {
    const opStr = this.code[this.ip].toString();
    const code = parseInt(opStr.slice(-2), 10);
    const modes = reverse(
      padStart(
        opStr.slice(0, -2),
        MAX_OPERANDS
      ).split('')
    ).map(this.strToCode);

    const op = {
      code,
      modes
    };

    return op;
  }

  private strToCode(numStr: string): Mode {
    const num = parseInt(numStr, 10);
    switch (num) {
      case 1:
        return Mode.IMMEDIATE;
      case 2:
        return Mode.RELATIVE;
      case 0:
      default:
        return Mode.POSITION;
    }
  }

  // This should only be used for retrieval, since it only returns a value
  // When Mode is IMMEDIATE, the passed `val` is the desired value
  // When Mode is POSITION, the value in the code at the position of `val` is the desired value
  // When Mode is RELATIVE, the value in the code at the position of `val + this.`
  private toVal(val: number, mode: Mode) {
    // return mode === Mode.IMMEDIATE ? val : this.code[val];
    let output;
    switch (mode) {
      case Mode.POSITION:
        output = this.code[val];
        break;
      case Mode.IMMEDIATE:
        output = val;
        break;
      case Mode.RELATIVE:
        output = this.code[val + this.relBase];
        break;
    }
    return isNil(output) ? 0 : output;
  }

  // This exists to handle cases of writing to the code based of write modes (POSITION or RELATIVE)
  private write(index: number, mode: Mode, value: number) {
    switch (mode) {
      case Mode.POSITION:
        this.code[index] = value;
        break;
      case Mode.IMMEDIATE:
        throw new Error('Cannot write to value in IMMEDIATE mode');
      case Mode.RELATIVE:
        this.code[index + this.relBase] = value;
        break;
    }
  }
}

// type NullableTimeout = NodeJS.Timeout | null;

// const awaitWithTimeout = (): [Promise<null>, () => void] => {
//   let wait: NullableTimeout = null;

//   const timeout = new Promise<null>(resolve => {
//     wait = setTimeout(() => {
//       clearTimeout(wait as NodeJS.Timeout);
//       resolve(null);
//     }, TIMEOUT);
//   });

//   const cancel = () => clearTimeout(wait as NodeJS.Timeout);

//   return [timeout, cancel];
// };

// type anyFunc = (...args: any[]) => any;

// const inputWithTimeout = (cb: InputCallback): InputCallback => {
//   const [timeout, cancel] = awaitWithTimeout();

//   return async () => {
//     const output = await Promise.race([
//       cb(),
//       timeout
//     ]);

//     if (output !== null) {
//       cancel();
//       return output;
//     }

//     throw new Error('Waited too long for input');
//   };
// };

export default IntcodeCPU;
