import { PROJECTILE_TYPE } from '../utils/constants.js';

export const PROJECTILES = {
  [PROJECTILE_TYPE.BULLET]: {},
  [PROJECTILE_TYPE.ROCKET]: {}
};

export class Projectile {
  constructor(type, pos, goal) {
    this.type = type;
    this.pos = pos;
    this.goal = goal;
  }
}
