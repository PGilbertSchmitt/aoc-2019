
import { zip, reverse, isNil } from 'lodash';
import { Vector2 } from '../tools/vectors';

export enum Tile {
  WALL = 0,
  EMPTY = 1,
  OXYGEN = 2,
  UNKNOWN = 3,
  DROID_N = 4,
  DROID_S = 5,
  DROID_W = 6,
  DROID_E = 7,
}

export enum Dir {
  NORTH = 1,
  SOUTH = 2,
  WEST = 3,
  EAST = 4,
}

type TileNode = {
  root: false;
  vec: Vector2;
  parent: TileNode;
  parentRel: Dir;
  dist: number;
} | {
  root: true;
  vec: Vector2;
};

class Tilemap {
  private map: Map<string, Tile>;
  private oxygen?: Vector2;

  constructor() {
    this.map = new Map();
    this.set(new Vector2(), Tile.EMPTY);
  }

  public set = (location: Vector2, tile: Tile) => {
    this.map.set(location.toString(), tile);
    if (tile === Tile.OXYGEN) {
      this.oxygen = location;
    }
  }

  public get = (location: Vector2) => {
    return this.map.get(location.toString());
  }

  // Not as efficient but that's okay
  public entries = () => {
    const pointArray: Array<[Vector2, Tile]> = [];
    const points = this.map.entries();

    let curPoint = points.next();
    while (!curPoint.done) {
      const [ vecStr, tile ] = curPoint.value;
      pointArray.push([Vector2.fromString(vecStr), tile]);
      curPoint = points.next();
    }

    return pointArray;
  }

  public pathToNode = (tile: Tile, startLoc: Vector2) => {
    const foundNode = this.buildPathToNode(startLoc, tile);
    if (foundNode === undefined) {
      return null;
    }

    const path = [foundNode.parentRel];
    let curNode = foundNode.parent;
    while (!curNode.root) {
      path.push(curNode.parentRel);
      curNode = curNode.parent;
    }
    return reverse(path);
  }

  public calcOxygenTime = () => {
    if (this.oxygen) {
      this.buildPathToNode(this.oxygen);
    }
  }

  private buildPathToNode = (startLoc: Vector2, tile?: Tile) => {
    // This set prevents checking already checked tiles
    const pointSet = new Set<string>();
    pointSet.add(startLoc.toString());

    const rootNode: TileNode = {
      root: true,
      vec: startLoc
    };

    const treeQueue: TileNode[] = [rootNode];

    let maxDistance = 0;

    // This loop should never finish unless the expected tile doesn't exist
    while (treeQueue.length) {
      const curNode = treeQueue.shift();
      if (!curNode) {
        break;
      }

      const neighbors = zip(
        curNode.vec.neighbors(),
        // The reverse directions
        [Dir.NORTH, Dir.EAST, Dir.SOUTH, Dir.WEST]
      ) as Array<[Vector2, Dir]>;

      for (const neighbor of neighbors) {
        const [ vec, dir ] = neighbor;
        let curTile = this.get(vec);
        curTile = isNil(curTile) ? Tile.UNKNOWN : curTile;
        if (!pointSet.has(vec.toString())) {
          const newNode: TileNode = {
            root: false,
            parent: curNode,
            parentRel: dir,
            dist: curNode.root ? 1 : curNode.dist + 1,
            vec
          };

          if (newNode.dist > maxDistance) {
            maxDistance = newNode.dist;
          }

          if (!isNil(tile) && curTile === tile) {
            return newNode;
          }

          if (curTile === Tile.EMPTY) {
            treeQueue.push(newNode);
          }
        }
        pointSet.add(vec.toString());
      }
    }

    if (!tile) {
      console.log(`Greatest distance found was ${maxDistance}.`);
    }
  }
}

export default Tilemap;
