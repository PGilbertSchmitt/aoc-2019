import getInput, { FieldInput } from './fields';
import { locateBest } from './locator_1';

const main = (fi: FieldInput) => {
  const input = getInput(fi);
  const [[x, y], visible] = locateBest(input);
  console.log(`Position of ${x},${y} can see ${visible} other asteroids!`);
};

main(FieldInput.D);
