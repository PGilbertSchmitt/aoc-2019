// Originally used for day 9

import { reverse, padStart, isNil } from 'lodash';
import { questionInt } from 'readline-sync';

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

class IntcodeCPU {
  private program: number[];
  private code: number[] = [];
  private ip: number = 0;
  private relBase: number = 0;

  constructor(program: number[]) {
    this.program = program;
  }

  public load(noun?: number, verb?: number) {
    this.ip = 0;
    this.relBase = 0;
    this.code = [...this.program];
  }

  public exec(): number {
    if (this.ip !== 0) {
      console.log('CPU must be reloaded before running');
      return 0;
    }

    let op = this.getCode();

    while (op.code && op.code !== Ops.HALT) {
      this.step(op);
      op = this.getCode();
    }

    return this.code[0];
  }

  public step(op: Operator) {
    switch (op.code) {
      case Ops.ADD:
        this.opAdd(op.modes);
        break;
      case Ops.MULT:
        this.opMult(op.modes);
        break;
      case Ops.SET:
        this.opSet(op.modes);
        break;
      case Ops.GET:
        this.opGet(op.modes);
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
      case Ops.SET:
      case Ops.GET:
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
  private opSet([aMode]: Mode[]) {
    const codeIp = this.ip;
    const [a] = this.retrieveOperands(1);
    const input = questionInt(`${this.prompt(codeIp)}: ${a} <? `);
    this.write(a, aMode, input);
  }

  // Outputs
  private opGet([aMode]: Mode[]) {
    const codeIp = this.ip;
    const [a] = this.retrieveOperands(1);
    const value = this.toVal(a, aMode);
    console.log(`${this.prompt(codeIp)} > [${value}]`);
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

export default IntcodeCPU;
