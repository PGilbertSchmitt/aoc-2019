import { decodeImage } from './decoder';
import { dataAsString } from './pixel_data';

const WIDTH = 25;
const HEIGHT = 6;
type pixel = 0 | 1 | 2;

const firstOpaquePixel = (pixels: pixel[]): pixel => {
  for (const p of pixels) {
    if (p !== 2) {
      return p;
    }
  }
  return 2;
};

const pixelToString = (p: pixel) => {
  switch (p) {
    case 0:
      // Black (nothing for my terminal)
      return '  ';
    case 1:
      // White
      return '##';
    case 2:
      // Transparent
      return '  ';
  }
};

const printImage = (imageData: pixel[][]) => {
  for (const row of imageData) {
    console.log(row.map(pixelToString).join(''));
  }
};

const main = () => {
  const dataAsArray = dataAsString.split('').map(n => parseInt(n, 10));
  const imageLayers = decodeImage(WIDTH, HEIGHT, dataAsArray) as pixel[][][];

  const numLayers = imageLayers.length;
  const image: pixel[][] = [];

  for (let rowIdx = 0; rowIdx < HEIGHT; rowIdx++) {
    const row: pixel[] = [];

    for (let colIdx = 0; colIdx < WIDTH; colIdx++) {
      const pixelValues = imageLayers.map(layer => layer[rowIdx][colIdx]);
      row.push(firstOpaquePixel(pixelValues));
    }

    image.push(row);
  }

  printImage(image);
};

main();
