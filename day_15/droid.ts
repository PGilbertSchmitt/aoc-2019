import { Channel, channel, take, put } from '@paybase/csp';
import { keyIn } from 'readline-sync';
import { reverse } from 'lodash';
import IntcodeCPU from '../tools/intcode_cpu_csp';
import { Vector2 } from '../tools/vectors';

import { program } from './program';

enum Status {
  WALL = 0,
  EMPTY = 1,
  OXYGEN = 2,
  UNKNOWN = 3,
  DROID_N = 4,
  DROID_S = 5,
  DROID_W = 6,
  DROID_E = 7,
}

enum Dir {
  NORTH = 1,
  SOUTH = 2,
  WEST = 3,
  EAST = 4,
}

class Droid {
  private brain: IntcodeCPU;
  private statusQueue: Channel<Status>;
  private location: Vector2;
  private lastDirection: Dir;
  private minCoor: Vector2;
  private maxCoor: Vector2;
  private shipMap: Map<string, Status>;

  constructor() {
    this.statusQueue = channel();
    this.location = new Vector2();
    this.minCoor = new Vector2();
    this.maxCoor = new Vector2();
    this.shipMap = new Map();
    this.lastDirection = Dir.NORTH;

    this.brain = new IntcodeCPU(program, {
      inputTimeout: -1,
      inputCB: this.getInput,
      outputCB: (status: Status) => put(this.statusQueue, status)
    });
  }

  public start = async () => {
    this.brain.load();
    let done = false;
    this.brain.exec().catch(e => {
      // CPU can stop loudly
      console.log(e);
      console.log('Goodbye!');
      done = true;
    });

    while (!done) {
      const status = await take(this.statusQueue);
      this.handleMove(status);
    }
  }

  private getInput = async () => {
    // Print map here
    this.printMap();

    const key = this.getUserInput();
    const dir = this.keyToDir(key);

    if (dir === null) {
      return 'kill';
    } else {
      this.lastDirection = dir;
      return dir;
    }
  }

  private getUserInput = () => {
    return keyIn('> ', {
      limit: 'wasdk'
    });
  }

  private keyToDir = (key: string) => {
    switch (key) {
      case 'w':
        return Dir.NORTH;
      case 's':
        return Dir.SOUTH;
      case 'a':
        return Dir.WEST;
      case 'd':
        return Dir.EAST;
      default:
        return null;
    }
  }

  private handleMove = (status: Status) => {
    const learnedPosition = this.facedPosition();
    this.updateBounds(learnedPosition);

    if (status !== Status.WALL) {
      this.location = learnedPosition;
      console.log('EMPTY');
    } else {
      console.log('HIT WALL');
    }

    this.shipMap.set(learnedPosition.toString(), status);
  }

  private facedPosition = () => {
    const dir = this.lastDirection;
    let [x, y] = [this.location.x, this.location.y];
    switch (dir) {
      case Dir.NORTH:
        y += 1;
        break;
      case Dir.SOUTH:
        y -= 1;
        break;
      case Dir.WEST:
        x -= 1;
        break;
      case Dir.EAST:
        x += 1;
        break;
    }
    return new Vector2(x, y);
  }

  private updateBounds = (newLoc: Vector2) => {
    if (newLoc.x > this.maxCoor.x) {
      this.maxCoor = new Vector2(newLoc.x, this.maxCoor.y);
    }

    if (newLoc.y > this.maxCoor.y) {
      this.maxCoor = new Vector2(this.maxCoor.x, newLoc.y);
    }

    if (newLoc.x < this.minCoor.x) {
      this.minCoor = new Vector2(newLoc.x, this.minCoor.y);
    }

    if (newLoc.y < this.minCoor.y) {
      this.minCoor = new Vector2(this.minCoor.x, newLoc.y);
    }
  }

  private printMap = () => {
    const [xMin, xMax, yMin, yMax] = [
      this.minCoor.x,
      this.maxCoor.x,
      this.minCoor.y,
      this.maxCoor.y,
    ];
    console.log([xMin, xMax, yMin, yMax]);
    const blankRow = Array.from(new Array(xMax - xMin + 1)).map(() => Status.UNKNOWN);
    const grid = Array.from(new Array(yMax - yMin + 1)).map(() => [...blankRow]);
    // console.log(grid);

    const mapPoints = this.shipMap.entries();
    let curPoint = mapPoints.next();
    while (!curPoint.done) {
      const point = Vector2.fromString(curPoint.value[0]);
      grid[point.y - yMin][point.x - xMin] = curPoint.value[1];
      curPoint = mapPoints.next();
    }
    grid[this.location.y - yMin][this.location.x - xMin] = this.dirToStatus(this.lastDirection);

    const boxRow = `@${blankRow.map(() => '-').join('')}@`;
    console.log(boxRow);
    reverse(grid).forEach(row => {
      console.log(`|${row.map(stat => this.mapStatusToChar(stat)).join('')}|`);
    });
    console.log(boxRow);

  }

  private mapStatusToChar = (status: Status) => {
    switch (status) {
      case Status.UNKNOWN:
        return ' ';
      case Status.EMPTY:
        return '.';
      case Status.WALL:
        return '#';
      case Status.OXYGEN:
        return 'O';
      case Status.DROID_N:
        return '^';
      case Status.DROID_S:
        return 'V';
      case Status.DROID_W:
        return '<';
      case Status.DROID_E:
        return '>';
    }
  }

  private dirToStatus = (dir: Dir) => {
    switch (dir) {
      case Dir.NORTH:
        return Status.DROID_N;
      case Dir.SOUTH:
        return Status.DROID_S;
      case Dir.WEST:
        return Status.DROID_W;
      case Dir.EAST:
        return Status.DROID_E;
    }
  }
}

export default Droid;
