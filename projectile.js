export const PROJECTILES = {
  bullet: {},
  rocket: {}
};

export class Projectile {
  constructor(type, pos, goal) {
    this.type = type;
    this.pos = pos;
    this.goal = goal;
  }
}
