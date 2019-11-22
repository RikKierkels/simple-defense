import { Vector } from './vector.js';

export const TOWERS = [
  {
    type: 'machine-gun',
    fireRate: 0.2,
    range: { x: 2, y: 2 },
    size: { x: 1, y: 1 }
  },
  {
    type: 'rockets',
    fireRate: 0.8,
    range: { x: 4, y: 4 },
    size: { x: 1, y: 1 }
  }
];

export class Tower {
  constructor(type, pos) {
    this.type = type;
    this.fireRate = TOWERS[type].fireRate;
    this.range = TOWERS[type].range;
    this.size = TOWERS[type].size;
    this.pos = pos;
  }

  get isPlaced() {
    return !!this.pos;
  }
}
