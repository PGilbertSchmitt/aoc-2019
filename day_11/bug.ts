export enum Color {
  BLACK,
  WHITE,
}

export type HullMap = Map<string, Color>;

type Pos = [number, number];

enum Dir {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

// Move forward to "turn clockwise", Move back to "turn counterclockwise"
const dirLoop = [Dir.UP, Dir.RIGHT, Dir.DOWN, Dir.LEFT];

class BugBot {
  private DEFAULT_COLOR = Color.BLACK;
  private hull: HullMap;
  private curPosition: Pos;
  private dirIndex: number = 0; // Start facing up

  constructor(firstColor = Color.BLACK) {
    this.hull = new Map();
    this.curPosition = [0, 0];
    this.hull.set(BugBot.posToStr(this.curPosition), firstColor);
  }

  public moveForward() {
    let vec: Pos = [0, 0];
    switch (this.curDir()) {
      case Dir.UP:
        vec = [0, 1];
        break;
      case Dir.RIGHT:
        vec = [1, 0];
        break;
      case Dir.DOWN:
        vec = [0, -1];
        break;
      case Dir.LEFT:
        vec = [-1, 0];
        break;
    }
    const [x, y] = this.curPosition;
    const [dx, dy] = vec;
    this.curPosition = [x + dx, y + dy];
    // console.log('Bug is moving forward');
  }

  private curDir(): Dir {
    return dirLoop[this.dirIndex];
  }

  public turnClockwise() {
    this.dirIndex++;
    if (this.dirIndex > 3) {
      this.dirIndex = 0;
    }
    // console.log(`Bug is turning clockwise`);
  }

  public turnCounterClockwise() {
    this.dirIndex--;
    if (this.dirIndex < 0) {
      this.dirIndex = 3;
    }
    // console.log(`Bug is turning counterclockwise`);
  }

  public getColor() {
    return this.hull.get(BugBot.posToStr(this.curPosition)) || this.DEFAULT_COLOR;
  }

  public setColor(c: Color) {
    this.hull.set(BugBot.posToStr(this.curPosition), c);
  }

  public getHull() {
    return this.hull;
  }

  static posToStr(p: Pos) {
    return `${p[0]},${p[1]}`;
  }

  static strToPos(str: string): Pos {
    const [x, y] = str.split(',').map(n => parseInt(n, 10));
    return [x, y];
  }
}

export default BugBot;
