import { padStart } from 'lodash';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export const addVectors = (vectors: Vector3[]) => {
  return vectors.reduce((v1, v2) => ({
    x: v1.x + v2.x,
    y: v1.y + v2.y,
    z: v1.z + v2.z,
  }));
};

export const subtractVectors = (
  v1: Vector3,
  v2: Vector3
): Vector3 => {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
    z: v1.z - v2.z,
  };
};

export const vecToStr = ({ x, y, z }: Vector3) => {
  return `<x=${padScalar(x)} y=${padScalar(y)} z=${padScalar(z)}>`;
};

export const padScalar = (s: number) => {
  return padStart(`${s}`, 3, ' ');
};

export const energy = ({ x, y, z }: Vector3) => {
  return Math.abs(x) + Math.abs(y) + Math.abs(z);
};
