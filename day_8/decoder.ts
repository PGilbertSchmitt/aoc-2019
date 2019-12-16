type col = number;
type row = col[];
type layer = row[];
type image = layer[];

export const decodeImage = (width: number, height: number, pixels: number[]): image => {
  const layerSize = width * height;

  const pixelAt = (w: number, h: number, l: number): number => {
    return pixels[(l * layerSize) + (h * width) + w];
  };

  if (pixels.length % layerSize !== 0) {
    throw new Error(`Uneven last layer for ${width}X${height} image containing ${pixels.length} pixels`);
  }

  const numLayers = pixels.length / layerSize;
  const imageData: image = [];

  for (let layerIdx = 0; layerIdx < numLayers; layerIdx++) {
    const layerData: layer = [];

    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
      const rowData: row = [];

      for (let colIdx = 0; colIdx < width; colIdx++) {
        rowData.push(pixelAt(colIdx, rowIdx, layerIdx));
      }

      layerData.push(rowData);
    }

    imageData.push(layerData);
  }

  return imageData;
};
