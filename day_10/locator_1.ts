type Pos = [number, number];
interface Field {
  width: number;
  height: number;
  asteroids: Pos[];
}

export const locateBest = (fieldString: string): [Pos, number] => {
  const field = decodeField(fieldString);
  console.log(JSON.stringify(field));

  let best = {
    visible: 0,
    pos: [0, 0] as Pos, // this will definitely be rewritten
  };

  for (const location of field.asteroids) {
    console.log(`[***] Checking location ${ps(location)}`);
    const visibleAsteroids = numVisible(location, field);

    if (visibleAsteroids > best.visible) {
      best = {
        visible: visibleAsteroids,
        pos: location,
      };
    }
    console.log(`${visibleAsteroids} asteroids visible`);
  }

  return [best.pos, best.visible];
};

// Returns the number of other visible asteroids for a certain position
const numVisible = (pos: Pos, field: Field) => {
  // All positions that for sure cannot be seen
  const naughtyList = new Set<string>();

  // All positions to check
  // Since this sorts by manhattan distance, and since it will have a manhattan distance to itself of 0, the first in the list is ignored
  const checkList = [...field.asteroids].sort((a, b) => manDist(a, pos) - manDist(b, pos)).slice(1);

  // Checks if a passed position is valid
  const framed = ([a, b]: Pos) => {
    return a >= 0 && a < field.width && b >= 0 && b < field.height;
  };

  // Create function adding blocked views to the naughty list
  const findBlockedPositions = (other: Pos) => {
    const blockVector = getVec(pos, other);
    // console.log(`First, create blockVector (pos -> blocker) of ${ps(blockVector)}`);
    const nextVector = lowestCommonVector(blockVector);
    // console.log(`Then, that is simplified to ${ps(nextVector)}`);
    // Starting position
    let curPos = applyVec(applyVec(pos, blockVector), nextVector);
    // console.log(`Starting the search at ${ps(curPos)}`);
    while (framed(curPos)) {
      // console.log(`adding ${ps(curPos)} to the naughty list`);
      naughtyList.add(ps(curPos));
      curPos = applyVec(curPos, nextVector);
    }
  };

  let visible = 0;
  for (const ast of checkList) {
    if (!naughtyList.has(ps(ast))) {
      visible++;
      // console.log(`* ${ps(ast)} visible, checking for blocked asteroids...`);
      findBlockedPositions(ast);
    } else {
      // Else you've been naughty!
      // console.log(`${ps(ast)} was naughty`);
    }
  }
  return visible;
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
const decodeField = (fieldString: string): Field => {
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
