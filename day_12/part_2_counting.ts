import { Moon } from './moon';

/**
 * BAD VERSION
 *
 * I learned through the reddit help on this question that the x, y, and z
 * slices of state can be independently verified, since the x position will
 * never affect the y gravity or z gravity, and vice versa. All I need to
 * do is find the LCM of the three numbers, which was coded in the part_2.ts
 * file. It took 2.62 seconds to calculate, which is just over 1 second if
 * accounting for compiling time. This version of the solution will also
 * find the correct answer, but since it took XXX seconds to calculate the
 * example with an answer of 4686774924, it would probably take this program
 * about XXX to calculate the actual answer using the obvious method.
 *
 * Ain't NOBODY got time fo dat
 */

const main = () => {
  // <x=13, y = -13, z = -2 >
  // <x=16, y = 2, z = -15 >
  // <x=7, y = -18, z = -12 >
  // <x=-3, y = -8, z = -8 >

  // const ioInitialState = { x: 13, y: -13, z: -2 };
  // const europaInitialState = { x: 16, y: 2, z: -15 };
  // const ganymedeInitialState = { x: 7, y: -18, z: -12 };
  // const callistoInitialState = { x: -3, y: -8, z: -8 };

  // {x:-8, y : -10, z : 0 }
  // {x:5, y : 5, z : 10 }
  // {x:2, y : -7, z : 3 }
  // {x:9, y : -8, z : -3 }
  const ioInitialState = { x: -8, y: -10, z: 0 };
  const europaInitialState = { x: 5, y: 5, z: 10 };
  const ganymedeInitialState = { x: 2, y: -7, z: 3 };
  const callistoInitialState = { x: 9, y: -8, z: -3 };

  const Io = new Moon(ioInitialState, 'Io');
  const Europa = new Moon(europaInitialState, 'Europa');
  const Ganymede = new Moon(ganymedeInitialState, 'Ganymede');
  const Callisto = new Moon(callistoInitialState, 'Callisto');

  const moons = [Io, Europa, Ganymede, Callisto];

  let iteration = 0;
  while (true) {
    step(moons);
    iteration++;

    if (iteration % 1000000 === 0) {
      console.log(`Iter: ${iteration}`);
    }

    // Since states can also be calculated in reverse, the first state will be part of the loop
    if (Io.sameState(ioInitialState)
      && Europa.sameState(europaInitialState)
      && Ganymede.sameState(ganymedeInitialState)
      && Callisto.sameState(callistoInitialState)) {
      break;
    }
  }

  console.log(`Same state achieved after ${iteration} steps`);
};

const step = (moons: Moon[]) => {
  // First get all new velocities calculated
  for (const moon of moons) {
    moon.calculateGravity(moons.filter(m => m !== moon));
  }
  // Then apply the gravity of each moon to its own velocity
  for (const moon of moons) {
    moon.applyGravity();
  }
};

const printMoons = (idx: number, [Io, Europa, Ganymede, Callisto]: Moon[]) => {
  console.log(`After ${idx} steps`);
  console.log(Io.toStr(), `\tE=${Io.totalEnergy()}`);
  console.log(Europa.toStr(), `\tE=${Europa.totalEnergy()}`);
  console.log(Ganymede.toStr(), `\tE=${Ganymede.totalEnergy()}`);
  console.log(Callisto.toStr(), `\tE=${Callisto.totalEnergy()}`);
  console.log('');
};

main();
