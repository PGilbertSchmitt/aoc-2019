/* SECURE CONTAINER PART 1 */

const MIN = 134564;
const MAX = 585159;

const isValid = (password: number): boolean => {
  const passStr = password.toString();
  if (!passStr.match(/(\d)\1/)) {
    return false;
  }

  const passArr = passStr.split('').map(digStr => parseInt(digStr, 10));
  let last = 0;
  let valid = true;
  passArr.forEach(digit => {
    if (digit < last) {
      valid = false;
      return;
    }
    last = digit;
  });

  return valid;
};

const main = () => {
  let validCount = 0;
  const valids: number[] = [];

  for (let num = MIN; num < MAX; num++) {
    if (isValid(num)) { valids.push(num); validCount++; }
  }

  console.log(`There are ${validCount} valid passwords out of a possible ${MAX - MIN}. Good luck, Santa!`);
  console.log(`Here's a sample: ${valids.slice(0, 20)}`);
};

main();

export { };
