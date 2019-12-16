export type Pos = [number, number];
type NaughtyList = Map<string, Pos[]>;
type AsteroidSet = Set<string>;
interface Field {
  width: number;
  height: number;
  asteroids: Pos[];
}

// Fills the naughty list with all blocked asteroids for later
export const composeNaughtyList = (pos: Pos, field: Field) => {
  // All positions that for sure cannot be seen yet, keyed by the blocking position
  const naughtyList: NaughtyList = new Map();

  // All positions to check
  // Since this sorts by manhattan distance, and since it will have a manhattan distance to itself of 0, the first in the list is ignored
  const checkList = [...field.asteroids].sort((a, b) => manDist(a, pos) - manDist(b, pos)).slice(1);
  // This is useful for checking if a position is an asteroid
  const allAsteroids: AsteroidSet = new Set(checkList.map(ps));
  // This will be useful for checking if a position was already blocked
  const blockedAsteroids: AsteroidSet = new Set();

  // Checks if a passed position is valid
  const framed = ([a, b]: Pos) => {
    return a >= 0 && a < field.width && b >= 0 && b < field.height;
  };

  // Create function adding blocked views to the naughty list
  const findBlockedPositions = (other: Pos) => {
    // Ensuring that each blocker is a key, even if there's no value
    safeMapPush(naughtyList, other);

    const blockVector = getVec(pos, other);
    const nextVector = lowestCommonVector(blockVector);
    // Starting position
    let curPos = applyVec(applyVec(pos, blockVector), nextVector);
    while (framed(curPos)) {
      const curStr = ps(curPos);

      if (allAsteroids.has(curStr) && !blockedAsteroids.has(curStr)) {
        safeMapPush(naughtyList, other, curPos);
        blockedAsteroids.add(curStr);
      }
      curPos = applyVec(curPos, nextVector);
    }
  };

  for (const ast of checkList) {
    if (!blockedAsteroids.has(ps(ast))) {
      findBlockedPositions(ast);
    } else {
      // Else you've been naughty!
      console.log(`Blocked ${ps(ast)} is not visible`);
    }
  }

  return naughtyList;
};

// Returns the vector to get from the first position to the second
const getVec = ([a, b]: Pos, [c, d]: Pos): Pos => [c - a, d - b];

// Returns the point when a vector is applied to another point
const applyVec = ([a, b]: Pos, [c, d]: Pos): Pos => [a + c, b + d];

const lowestCommonVector = ([a, b]: Pos): Pos => {
  const devisor = gcd(Math.abs(a), Math.abs(b));
  return [a / devisor, b / devisor];
};

// Returns the greatest common devisor of two digits
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

// Returns the Manhattan distance between two positions (order doesn't matter);
const manDist = ([a, b]: Pos, [c, d]: Pos) => Math.abs(a - c) + Math.abs(b - d);

// Given an asteroid field string, returns a Field object containing width, height, and asteroid positions
export const decodeField = (fieldString: string): Field => {
  const rows = fieldString.trim().split('\n');
  const positions: Pos[] = [];
  rows.forEach((cols, i) => {
    cols.split('').forEach((area, j) => {
      if (area === '#') {
        positions.push([j, i]); // distance from left, then from top
      }
    });
  });

  return {
    width: rows[0].length,
    height: rows.length,
    asteroids: positions,
  };
};

const ps = ([a, b]: Pos): string => `${a},${b}`;

// Safely pushes new values into a naughty list
const safeMapPush = (nl: NaughtyList, at: Pos, value: Pos | null = null) => {
  const key = ps(at);
  const cur = nl.get(key);
  if (!value) {
    nl.set(key, []);
  } else if (!cur) {
    nl.set(key, [value]);
  } else {
    nl.set(key, [...cur, value]);
  }
};

export const orderByRotation = (pos: Pos, asteroids: Pos[]): Pos[] => {
  const sortable = asteroids.map(ast => [ast, checkableRadians(pos, ast)] as [Pos, number]);
  return sortable.sort(([_a, radA], [_b, radB]) => radA - radB).map(([ast, _]) => ast);
};

export const checkableRadians = ([a, b]: Pos, [c, d]: Pos): number => {
  // Swapping D and B because I'd like to flip the map around the horizontal axis
  const rads = Math.atan2(-1 * (c - a), -1 * (b - d)) + Math.PI;
  return Math.floor(rads * 10000000);
};
