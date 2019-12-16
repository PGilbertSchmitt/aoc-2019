import getField, { FieldInput } from './fields';
import {
  Pos,
  decodeField,
  composeNaughtyList,
  // orderByRotation,
  checkableRadians
} from './locator_2';

// Not worried about cleanliness on this day, just an answer

const main = (fs: FieldInput) => {
  const basePos = [17, 22] as Pos;
  const fieldString = getField(fs);
  const field = decodeField(fieldString);
  const naughtyList = composeNaughtyList(basePos, field);

  const toPos = (pos: string) => pos.split(',').map(n => parseInt(n, 10)) as Pos;

  // Build new map keyed on rotations
  const rotMap = new Map<number, Pos[]>();
  const naughtyKeys = naughtyList.keys();
  for (const posKey of Array.from(naughtyKeys)) {
    const pos = toPos(posKey);
    rotMap.set(checkableRadians(basePos, pos), [pos, ...(naughtyList.get(posKey) || [])]);
  }

  // Keeping track of when an asteroid gets blasted
  const killList = new Map<number, Pos>();

  const searchList = Array.from(rotMap.keys()).sort((a, b) => a - b);
  let searchIndex = 0;
  let blastCount = 1;

  while (rotMap.size > 0) {
    const rotation = searchList[searchIndex];

    if (rotMap.has(rotation)) {
      const astList = rotMap.get(rotation) as Pos[]; // Guaranteed to be array of length 1 or more
      const blasted = astList.pop() as Pos;
      killList.set(blastCount, blasted);
      blastCount++;

      if (astList.length === 0) {
        rotMap.delete(rotation);
      }
    }

    searchIndex++;
    if (searchIndex >= searchList.length) {
      searchIndex = 0;
    }
  }

  // console.log(`The 200th asteroid to be blasted is ${killList.get(200)}`);
  console.log(killList);
};

main(FieldInput.D);
