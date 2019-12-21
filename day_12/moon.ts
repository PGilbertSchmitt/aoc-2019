import { padEnd } from 'lodash';

import {
  Vector3,
  addVectors,
  subtractVectors,
  vecToStr as p,
  energy
} from './vector3';

export class Moon {
  public name: string;
  public location: Vector3;
  public velocity: Vector3;

  constructor(position: Vector3, name: string) {
    this.name = name;
    this.location = position;
    this.velocity = { x: 0, y: 0, z: 0 };
  }

  public calculateGravity(moons: Moon[]) {
    this.velocity = addVectors([
      this.velocity,
      ...moons.map(moon => this.diffPositions(moon))
    ]);
  }

  public applyGravity() {
    this.location = addVectors([this.location, this.velocity]);
  }

  private diffPositions(other: Moon): Vector3 {
    const diff = subtractVectors(this.location, other.location);
    const pull = {
      x: this.pull(diff.x),
      y: this.pull(diff.y),
      z: this.pull(diff.z),
    };
    return pull;
  }

  private pull(val: number) {
    if (val < 0) {
      return 1;
    }
    if (val > 0) {
      return -1;
    }
    return 0;
  }

  public toStr() {
    return `${padEnd(this.name, 8, ' ')} pos=${p(this.location)}\tvel=${p(this.velocity)}`;
  }

  public totalEnergy() {
    return energy(this.location) * energy(this.velocity);
  }

  public sameState(position: Vector3) {
    return this.location.x === position.x
      && this.location.y === position.y
      && this.location.z === position.z
      && this.velocity.x === 0
      && this.velocity.y === 0
      && this.velocity.z === 0;
  }
}
