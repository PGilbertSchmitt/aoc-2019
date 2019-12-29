import { Channel, channel, put, take } from '@paybase/csp';
import { keyIn } from 'readline-sync';
import IntcodeCPU from '../tools/intcode_cpu_csp';
import { gameData } from './game_file';

export enum Tile {
  EMPTY,
  WALL,
  BLOCK,
  PADDLE,
  BALL
}

class ArcadeCabinet {
  private cpu: IntcodeCPU;
  private map: Map<string, Tile>;
  private outputChannel: Channel<number | null>;
  private xMax = 50;
  private yMax = 50;
  private score = 0;

  constructor(selfPlay = false) {
    this.outputChannel = channel();
    this.map = new Map();

    this.cpu = new IntcodeCPU(gameData, {
      inputCB: selfPlay
        ? () => this.getUserInput()
        : () => this.getCorrectInput(),
      outputCB: output => put(this.outputChannel, output),
      // If the output channel ever outputs null instead of a number,
      // we know the cpu has finished operation
      finishedCB: () => put(this.outputChannel, null),
      inputTimeout: -1
    });
  }

  public load(overrides?: Array<[number, number]>) {
    this.cpu.load(overrides);
    this.map = new Map();
    this.score = 0;
  }

  public async start() {
    this.cpu.exec();

    let status = await this.getMapData();
    while (!status) {
      status = await this.getMapData();
    }
    this.printScreen();
    console.log('Congrats!');
  }

  public printScreen() {
    const screen = this.decodeScreen();
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
    // console.log(`'a' moves left, 's' or space does nothing, anything else moves right`);
    console.log(`Score: ${this.score}`);
    for (const row of screen) {
      console.log(row.map(tile => {
        switch (tile) {
          case Tile.EMPTY:
            return '   ';
          case Tile.BALL:
            return ' o ';
          case Tile.BLOCK:
            return '[ ]';
          case Tile.PADDLE:
            return '===';
          case Tile.WALL:
            return '###';
        }
      }).join(''));
    }
  }

  private decodeScreen() {
    const screenRow = Array.from(new Array(this.xMax + 1)).map(() => Tile.EMPTY);
    const screen = Array.from(new Array(this.yMax + 1)).map(() => [...screenRow]);

    const entries = this.map.entries();
    let entry = entries.next();
    while (!entry.done) {
      const [coorStr, tile] = entry.value;
      const [x, y] = coorStr.split(',').map(n => parseInt(n, 10));
      screen[y][x] = tile;
      entry = entries.next();
    }

    return screen;
  }

  private async getUserInput() {
    this.printScreen();
    const key = keyIn('> ');
    switch (key) {
      case 'a':
        return -1;
      case ' ':
      case 's':
        return 0;
      case 'q':
        throw new Error('Game quit');
      default:
        return 1;
    }
  }

  private async getCorrectInput() {
    this.printScreen();
    const [xBall, xPaddle] = this.findBallAndPaddleLocations();

    // This sleep is just so I can see it run
    await new Promise(res => {
      const wait = setTimeout(() => {
        clearTimeout(wait);
        res(null);
      }, 60);
    });

    if (xBall < xPaddle) {
      // Ball is to the left
      return -1;
    } else if (xBall > xPaddle) {
      // Ball is to the right
      return 1;
    }
    return 0;
  }

  private findBallAndPaddleLocations(): [number, number] {
    const entries = this.map.entries();
    let entry = entries.next();
    let xBall = -1;
    let xPaddle = -1;
    while ((xBall === -1 || xPaddle === -1) && !entry.done) {
      const [key, tile] = entry.value;
      if (tile === Tile.BALL) {
        [xBall] = this.keyToPos(key);
      }
      if (tile === Tile.PADDLE) {
        [xPaddle] = this.keyToPos(key);
      }
      entry = entries.next();
    }
    return [xBall, xPaddle];
  }

  // Returns `true` if CPU execution is finished, `false` if there is still execution,
  // or `null` (by timeoutWrapper) if there's no output
  private async getMapData() {
    const chan = this.outputChannel;

    const first = await take(chan);
    if (first === null) {
      return true;
    }

    // If first was a number, the second will definitely be a number
    const second = await take(chan) as number;

    // Based on the values of the previous two, the third will either be a tile
    // or a score (number);
    const third = await take(chan);

    if (first === -1 && second === 0) {
      this.score = third as number;
    } else {
      // Not a score, so must be a tile
      this.map.set(`${first},${second}`, third as Tile);
    }

    return false;
  }

  private keyToPos(key: string) {
    return key.split(',').map(n => parseInt(n, 10)) as [number, number];
  }
}

export default ArcadeCabinet;
