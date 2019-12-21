import { Moon } from './moon';
import { Vector3 } from './vector3';

const main = () => {
  // <x=13, y = -13, z = -2 >
  // <x=16, y = 2, z = -15 >
  // <x=7, y = -18, z = -12 >
  // <x=-3, y = -8, z = -8 >
  const Io = new Moon({ x: 13, y: -13, z: -2 }, 'Io');
  const Europa = new Moon({ x: 16, y: 2, z: -15 }, 'Europa');
  const Ganymede = new Moon({ x: 7, y: -18, z: -12 }, 'Ganymede');
  const Callisto = new Moon({ x: -3, y: -8, z: -8 }, 'Callisto');

  const moons = [Io, Europa, Ganymede, Callisto];

  // printMoons(0, moons);
  for (let i = 0; i < 1000; i++) {
    step(moons);
    // printMoons(i + 1, moons);
  }

  console.log(`Total Energy: ${moons.map(moon => moon.totalEnergy()).reduce((a, b) => a + b, 0)}`);
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
