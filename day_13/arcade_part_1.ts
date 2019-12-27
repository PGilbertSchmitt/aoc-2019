import { Channel, channel, put, take } from '@paybase/csp';
import { max } from 'lodash';
import IntcodeCPU, { OutputCallback } from '../tools/intcode_cpu_csp';
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
  private xMax = -1;
  private yMax = -1;

  constructor() {
    this.outputChannel = channel();
    this.map = new Map();

    this.cpu = new IntcodeCPU(gameData, {
      outputCB: output => put(this.outputChannel, output),
      finishedCB: () => put(this.outputChannel, null),
    });
  }

  public async loadMap() {
    this.load();
    this.cpu.exec();

    this.xMax = 0;
    this.yMax = 0;
    while (true) {
      const x = await take(this.outputChannel);
      if (x === null) {
        break;
      }
      const y = await take(this.outputChannel) as number;
      const tile = await take(this.outputChannel) as Tile;

      this.map.set(`${x},${y}`, tile);

      this.xMax = max([x, this.xMax]) as number;
      this.yMax = max([y, this.yMax]) as number;
    }
  }

  public getScreen() {
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

  public printScreen() {
    const screen = this.getScreen();
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

  public load() {
    this.cpu.load();
    this.map = new Map();
  }
}

export default ArcadeCabinet;
