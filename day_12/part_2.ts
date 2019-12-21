import { Moon } from './moon';
import { Vector3 } from './vector3';
import { flatten, isEqual } from 'lodash';

const main = () => {
  // <x=13, y = -13, z = -2 >
  // <x=16, y = 2, z = -15 >
  // <x=7, y = -18, z = -12 >
  // <x=-3, y = -8, z = -8 >

  const ioInitialState = { x: 13, y: -13, z: -2 };
  const europaInitialState = { x: 16, y: 2, z: -15 };
  const ganymedeInitialState = { x: 7, y: -18, z: -12 };
  const callistoInitialState = { x: -3, y: -8, z: -8 };

  const Io = new Moon(ioInitialState, 'Io');
  const Europa = new Moon(europaInitialState, 'Europa');
  const Ganymede = new Moon(ganymedeInitialState, 'Ganymede');
  const Callisto = new Moon(callistoInitialState, 'Callisto');

  const moons = [Io, Europa, Ganymede, Callisto];

  const [xSlice, ySlice, zSlice] = sla(['x', 'y', 'z']).map(k => slice(moons, k));

  let iteration = 0;
  let dx = 0;
  let dy = 0;
  let dz = 0;
  while (!dx || !dy || !dz) {
    step(moons);
    iteration++;

    // Since states can also be calculated in reverse, the first state will be part of the loop

    if (!dx && isEqual(xSlice, slice(moons, 'x'))) {
      dx = iteration;
      console.log(`Same X state achieved after ${dx} steps`);
    }

    if (!dy && isEqual(ySlice, slice(moons, 'y'))) {
      dy = iteration;
      console.log(`Same Y state achieved after ${dy} steps`);
    }

    if (!dz && isEqual(zSlice, slice(moons, 'z'))) {
      dz = iteration;
      console.log(`Same Z state achieved after ${dz} steps`);
    }
  }

  const intersection = lcm(lcm(dx, dy), dz);
  console.log(`Found intersection of slices at ${intersection}`);
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

const slice = (moons: Moon[], k: keyof Vector3) => {
  return moons.map(m => [m.location[k], m.velocity[k]]);
};

// stringLiteralArray
export const sla = <T extends string>(a: T[]) => a;

const lcm = (a: number, b: number): number =>
  (!a || !b) ? 0 : Math.abs((a * b) / gcd(a, b));

const gcd = (a: number, b: number): number =>
  b === 0 ? a : gcd(b, a % b);

main();
