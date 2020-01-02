import { Channel, channel, take, put } from '@paybase/csp';
import { keyIn } from 'readline-sync';
import { reverse } from 'lodash';
import IntcodeCPU from '../tools/intcode_cpu_csp';
import { Vector2 } from '../tools/vectors';
import Tilemap, { Tile, Dir } from './tilemap';
import { program } from './program';

class Droid {
  private brain: IntcodeCPU;
  private tileQueue: Channel<Tile>;
  private location: Vector2;
  private lastDirection: Dir;
  private minCoor: Vector2;
  private maxCoor: Vector2;
  private shipMap: Tilemap;
  private auto: boolean;
  private moveQueue: Dir[];

  constructor(auto = false) {
    this.tileQueue = channel();
    this.location = new Vector2();
    this.minCoor = new Vector2();
    this.maxCoor = new Vector2();
    this.shipMap = new Tilemap();
    this.lastDirection = Dir.NORTH;
    this.auto = auto;
    this.moveQueue = [];

    this.brain = new IntcodeCPU(program, {
      inputTimeout: -1,
      inputCB: this.getInput,
      outputCB: (tile: Tile) => put(this.tileQueue, tile)
    });
  }

  public start = async () => {
    this.brain.load();
    let done = false;
    this.brain.exec().catch(e => {
      // CPU can stop loudly
      // console.log(e);
      this.printMap();
      console.log('Goodbye!');
      done = true;
      const pathToOrigin = this.shipMap.pathToNode(Tile.OXYGEN, new Vector2());
      console.log(`The droid must travel ${pathToOrigin?.length} tiles to get to the oxygen`);

      this.shipMap.calcOxygenTime();
    });

    while (!done) {
      const tile = await take(this.tileQueue);
      this.handleMove(tile);
    }
  }

  private getInput = async () => {
    // Print map here
    // this.printMap();

    // await new Promise(res => setTimeout(res, 500));
    const dir = this.auto ? this.getAutoInput() : this.getUserInput();

    if (dir === null) {
      return 'kill';
    } else {
      this.lastDirection = dir;
      return dir;
    }
  }

  private getUserInput = () => {
    const key = keyIn('> ', {
      limit: 'wasdk'
    });
    return this.keyToDir(key);
  }

  private getAutoInput = () => {
    if (this.moveQueue.length === 0) {
      const newPath = this.shipMap.pathToNode(Tile.UNKNOWN, this.location);
      if (newPath === null) {
        throw new Error('Not sure where to go');
      }
      this.moveQueue = newPath;
    }
    return this.moveQueue.shift() as Dir;
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

  private handleMove = (tile: Tile) => {
    const learnedPosition = this.facedPosition();
    this.updateBounds(learnedPosition);

    if (tile !== Tile.WALL) {
      this.location = learnedPosition;
      // console.log('EMPTY');
    } else {
      // console.log('HIT WALL');
    }

    this.shipMap.set(learnedPosition, tile);
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
    // console.log([xMin, xMax, yMin, yMax]);
    const blankRow = Array.from(new Array(xMax - xMin + 1)).map(() => Tile.UNKNOWN);
    const grid = Array.from(new Array(yMax - yMin + 1)).map(() => [...blankRow]);
    // console.log(grid);

    this.shipMap.entries().forEach(([ point, tile ]) => {
      grid[point.y - yMin][point.x - xMin] = tile;
    });
    // Overwrite the current location of the droid
    grid[this.location.y - yMin][this.location.x - xMin] = this.dirToTile(this.lastDirection);

    const boxRow = `@@${blankRow.map(() => '~~').join('')}@@`;
    console.log(boxRow);
    console.log(boxRow);
    reverse(grid).forEach(row => {
      console.log(`||${row.map(stat => this.mapTileToChar(stat)).join('')}||`);
    });
    console.log(boxRow);
    console.log(boxRow);
  }

  private mapTileToChar = (tile: Tile) => {
    switch (tile) {
      case Tile.UNKNOWN:
        return '  ';
      case Tile.EMPTY:
        return '--';
      case Tile.WALL:
        return '##';
      case Tile.OXYGEN:
        return '><';
      case Tile.DROID_N:
        return '^^';
      case Tile.DROID_S:
        return 'vv';
      case Tile.DROID_W:
        return '<<';
      case Tile.DROID_E:
        return '>>';
    }
  }

  private dirToTile = (dir: Dir) => {
    switch (dir) {
      case Dir.NORTH:
        return Tile.DROID_N;
      case Dir.SOUTH:
        return Tile.DROID_S;
      case Dir.WEST:
        return Tile.DROID_W;
      case Dir.EAST:
        return Tile.DROID_E;
    }
  }
}

export default Droid;
