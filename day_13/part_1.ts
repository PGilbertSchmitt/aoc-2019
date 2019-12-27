import { flatten } from 'lodash';
import Arcade, { Tile } from './arcade_part_1';

const main = async () => {
  const arcade = new Arcade();
  await arcade.loadMap();
  const screen = arcade.getScreen();
  arcade.printScreen();
  const numBlocks = flatten(screen).reduce((a, b) => a + (b === Tile.BLOCK ? 1 : 0), 0);
  console.log(`There are ${numBlocks} blocks on the screen`);
};

main();
