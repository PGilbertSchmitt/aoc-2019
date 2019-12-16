// Originally used for day 7

import { reverse, padStart } from 'lodash';
// import { questionInt } from 'readline-sync';
import { Channel, put, alts, drain } from '@paybase/csp';

const MAX_OPERANDS = 3;

enum Ops {
  ADD = 1,
  MULT = 2,
  SET = 3,
  GET = 4,
  JUMP_IF_TRUE = 5,
  JUMP_IF_FALSE = 6,
  LESS_THAN = 7,
  EQUAL_TO = 8,
  HALT = 99
}

enum Mode {
  POSITION = 0,
  IMMEDIATE = 1
}

interface Operator {
  code: Ops;
  modes: number[];
}

type Chan = Channel<number>;

class IntcodeCPU {
  private program: number[];
  private code: number[];
  private ip: number;
  private inputChans: Chan[];
  private outputChan: Chan;
  private finalOutputChan: Chan | null;
  private lastOutput: number;

  constructor(
    program: number[],
    inputs: Chan[],
    output: Chan,
    finalOutput: (Chan | null) = null
  ) {
    this.program = program;
    this.code = [];
    this.ip = 0;
    this.inputChans = inputs;
    this.outputChan = output;
    this.finalOutputChan = finalOutput;
    this.lastOutput = 0;
  }

  public load() {
    this.ip = 0;
    this.code = [...this.program];
    this.lastOutput = 0;
    Promise.all(this.inputChans.map(drain));
  }

  public async exec() {
    if (this.ip !== 0) {
      console.log('CPU must be reloaded before running');
    }

    let op = this.getCode();

    while (op.code && op.code !== Ops.HALT) {
      await this.step(op);
      op = this.getCode();
    }

    if (this.finalOutputChan !== null) {
      await put(this.finalOutputChan, this.lastOutput);
    }
  }

  public async step(op: Operator) {
    // console.log(`@ ${this.ip}: ${JSON.stringify(op)}`);
    switch (op.code) {
      case Ops.ADD:
        this.opAdd(op.modes);
        break;
      case Ops.MULT:
        this.opMult(op.modes);
        break;
      case Ops.SET:
        await this.opSet();
        break;
      case Ops.GET:
        await this.opGet();
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
      default:
        throw new Error(`Unexpected op ${op.code} @ ${this.ip}`);
    }

    if ((op.code !== Ops.JUMP_IF_FALSE) && op.code !== Ops.JUMP_IF_TRUE) {
      this.pushIp(op.code);
    }
  }

  private async getInput() {
    return await alts(...this.inputChans);
  }

  private async sendOutput(output: number) {
    this.lastOutput = output;
    put(this.outputChan, output);
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
      case Ops.SET:
      case Ops.GET:
        this.ip += 2;
        break;
    }
  }

  // _cMode does not need to be retrieved, but doing so for transparency
  // It is a guaranteed position arg
  private opAdd([aMode, bMode, _cMode]: Mode[]) {
    const [a, b, c] = this.retrieveOperands(3);
    this.code[c] = this.toVal(a, aMode) + this.toVal(b, bMode);
  }

  // _cMode does not need to be retrieved, but doing so for transparency
  // It is a guaranteed position arg
  private opMult([aMode, bMode, _cMode]: Mode[]) {
    const [a, b, c] = this.retrieveOperands(3);
    this.code[c] = this.toVal(a, aMode) * this.toVal(b, bMode);
  }

  // No mode value for the only operand since it's a guaranteed position arg
  private async opSet() {
    const [a] = this.retrieveOperands(1);
    const input = await this.getInput();
    this.code[a] = input;
  }

  // No mode value for the only operand since it's a guaranteed position arg
  private async opGet() {
    const [a] = this.retrieveOperands(1);
    await this.sendOutput(this.code[a]);
  }

  // _bMode does not need to be retrieved, but doing so for transparency
  // It is a guaranteed position arg
  private opJump(isTrue: boolean, [aMode, bMode]: Mode[]) {
    const [a, b] = this.retrieveOperands(2);
    const newIp = this.toVal(b, bMode);
    if (this.toVal(a, aMode) === 0) {
      this.ip = isTrue ? (this.ip + 3) : newIp;
    } else {
      this.ip = !isTrue ? (this.ip + 3) : newIp;
    }
  }

  // _cMode does not need to be retrieved, but doing so for transparency
  // It is a guaranteed position arg
  private opLessThan([aMode, bMode, _cMode]: Mode[]) {
    const [a, b, c] = this.retrieveOperands(3);
    this.code[c] = this.toVal(a, aMode) < this.toVal(b, bMode) ? 1 : 0;
  }

  private opEqualTo([aMode, bMode, _cMode]: Mode[]) {
    const [a, b, c] = this.retrieveOperands(3);
    this.code[c] = this.toVal(a, aMode) === this.toVal(b, bMode) ? 1 : 0;
  }

  private prompt(ip: number) {
    return `@ ${padStart(`${ip}`, 3)}`;
  }

  private getCode(): Operator {
    const opStr = this.code[this.ip].toString();
    const code = parseInt(opStr.slice(-2), 10);
    const modes = reverse(
      padStart(
        opStr.slice(0, -2),
        MAX_OPERANDS
      ).split('')
    ).map(m => m === '1' ? Mode.IMMEDIATE : Mode.POSITION);

    const op = {
      code,
      modes
    };
    // console.log(`Code ${opStr} creates op ${JSON.stringify(op)}`);
    return op;
  }

  // When Mode is IMMEDIATE, the passed `val` is the desired value
  // When Mode is POSITION, the value in the code at the position of `val` is the desired value
  private toVal(val: number, mode: Mode) {
    return mode === Mode.IMMEDIATE ? val : this.code[val];
  }
}

export default IntcodeCPU;
