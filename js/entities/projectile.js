import { PROJECTILE_TYPE } from '../utils/constants.js';

export const PROJECTILES = {
  [PROJECTILE_TYPE.BULLET]: {
    speed: 1,
    damage: 20
  },
  [PROJECTILE_TYPE.ROCKET]: {
    speed: 0.5,
    damage: 40
  }
};

export class Projectile {
  constructor(type, pos, goal) {
    this.type = type;
    this.pos = pos;
    this.goal = goal;
    this.speed = PROJECTILES[type].speed;
    this.damage = PROJECTILES[type].damage;
  }

  static create(type, pos, goal) {
    return new Projectile(type, pos, goal);
  }
}
