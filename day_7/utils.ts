import { channel } from '@paybase/csp';

export const makeChan = () => channel<number>();

export const perms = (options: number[]) => {
  const result: number[][] = [];

  const permute = (optArr: number[], m: number[] = []) => {
    if (optArr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < optArr.length; i++) {
        const cur = optArr.slice();
        const next = cur.splice(i, 1);
        permute(cur.slice(), m.concat(next));
      }
    }
  };

  permute(options);

  return result;
};
