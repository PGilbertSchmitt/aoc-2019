/* SECURE CONTAINER PART 2 */
import { includes } from 'lodash';

const MIN = 134564;
const MAX = 585159;

const multiplesRule = (pass: string): boolean => {
  const groupLengths: number[] = [];
  let counter = 1;
  let last = '';
  const passArr = pass.split('');
  passArr.forEach(dig => {
    if (dig === last) {
      counter++;
    } else {
      groupLengths.push(counter);
      last = dig;
      counter = 1;
    }
  });
  groupLengths.push(counter);

  return includes(groupLengths, 2);
};

const ascRule = (pass: string): boolean => {
  const passArr = pass.split('').map(digStr => parseInt(digStr, 10));
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

const isValid = (num: number): boolean => {
  const numStr = num.toString();
  return multiplesRule(numStr) && ascRule(numStr);
};

const main = () => {
  const valids: number[] = [];
  for (let num = MIN; num < MAX; num++) {
    if (isValid(num)) {
      valids.push(num);
    }
  }

  console.log(`There are ${valids.length} valid passwords out of a possible ${MAX - MIN}. Good luck, Santa!`);
};

main();

export { };
