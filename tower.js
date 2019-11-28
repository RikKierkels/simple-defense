import { Vector } from './vector.js';

export const TOWERS = [
  {
    type: 'machine-gun',
    fireRate: 0.2,
    range: new Vector(2, 2),
    size: new Vector(1, 1)
  },
  {
    type: 'rockets',
    fireRate: 0.8,
    range: new Vector(4, 4),
    size: new Vector(1, 1)
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
