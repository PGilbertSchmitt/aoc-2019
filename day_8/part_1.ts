import { decodeImage } from './decoder';
import { dataAsString } from './pixel_data';

const count = (layer: number[][], find: number): number => {
  let num = 0;
  for (const row of layer) {
    for (const col of row) {
      if (col === find) {
        num++;
      }
    }
  }
  return num;
};

const main = () => {
  const dataAsArray = dataAsString.split('').map(n => parseInt(n, 10));
  const image = decodeImage(25, 6, dataAsArray);

  let best = {
    layer: [] as number[][],
    zeroCount: dataAsArray.length,
  };

  for (const layer of image) {
    const zeroCount = count(layer, 0);
    if (zeroCount < best.zeroCount) {
      best = {
        layer,
        zeroCount,
      };
    }
  }

  console.log(`Checksum is ${count(best.layer, 1) * count(best.layer, 2)}`);
};

main();
