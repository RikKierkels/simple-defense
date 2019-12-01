import { Vector } from './vector.js';

export const TOWERS = {
  'machine-gun': {
    cost: 30,
    fireRate: 0.2,
    range: new Vector(2, 2),
    size: new Vector(1, 1)
  },
  'rockets': {
    cost: 40,
    fireRate: 0.8,
    range: new Vector(4, 4),
    size: new Vector(1, 1)
  }
};

export class Tower {
  constructor(type, pos) {
    this.type = type;
    this.cost = TOWERS[type].cost;
    this.fireRate = TOWERS[type].fireRate;
    this.range = TOWERS[type].range;
    this.size = TOWERS[type].size;
    this.pos = pos;
  }
}
