// Originally used for Day 2

const NOUN_INDEX = 1;
const VERB_INDEX = 2;

type operands = [number, number, number];

class IntcodeCPU {
  private program: number[];
  private code: number[];
  private ip: number;

  constructor(program: number[]) {
    this.program = program;
    this.ip = 0;
  }

  public load(noun?: number, verb?: number) {
    this.ip = 0;
    this.code = [...this.program];

    if (noun && verb) {
      this.code[NOUN_INDEX] = noun;
      this.code[VERB_INDEX] = verb;
    }
  }

  public exec(): number {
    if (this.ip !== 0) {
      console.log('CPU must be reloaded before running');
      return null;
    }

    let curCode = this.getCode();

    while (curCode !== 99 && curCode !== undefined) {
      switch (curCode) {
        case 1:
          this.op1();
          break;
        case 2:
          this.op2();
          break;
        default:
          throw new Error(`Unexpected op ${curCode}`);
      }

      curCode = this.getCode();
    }

    return this.code[0];
  }

  // Acquires 3 operands, then pushes the ip to the next operator
  private retrieveOperands(): operands {
    const ops: operands = [this.code[this.ip + 1], this.code[this.ip + 2], this.code[this.ip + 3]];
    this.ip += 4;
    return ops;
  }

  private op1() {
    const [a, b, c] = this.retrieveOperands();
    this.code[c] = this.code[a] + this.code[b];
  }

  private op2() {
    const [a, b, c] = this.retrieveOperands();
    this.code[c] = this.code[a] * this.code[b];
  }

  private getCode() {
    return this.code[this.ip];
  }
}

export default IntcodeCPU;
