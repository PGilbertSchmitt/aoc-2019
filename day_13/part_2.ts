import Arcade, { Tile } from './arcade';
import IntcodeCPU from '../tools/intcode_cpu_csp';
import { gameData } from './game_file';

const main = async () => {
  const arcade = new Arcade(false);
  arcade.load([[0, 2]]);
  try {
    await arcade.start();
  } catch (e) {
    console.log(e);
  }

  console.log('Goodbye!');

  // const cpu = new IntcodeCPU(gameData);
  // cpu.load([[0, 2]]);
  // cpu.exec();
};

main();
