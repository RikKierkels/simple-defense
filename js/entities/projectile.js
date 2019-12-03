import {
  ACTOR_STATUS,
  PROJECTILE_TYPE,
  PROJECTILE_STATUS
} from '../utils/constants.js';

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
  constructor(
    type,
    pos,
    targetId,
    status = PROJECTILE_STATUS.MOVING_TO_TARGET
  ) {
    this.type = type;
    this.pos = pos;
    this.targetId = targetId;
    this.status = status;
    this.speed = PROJECTILES[type].speed;
    this.damage = PROJECTILES[type].damage;
  }

  static create(type, pos, targetId) {
    return new Projectile(type, pos, targetId);
  }
}

Projectile.prototype.despawn = function() {
  return new Projectile(
    this.type,
    this.pos,
    this.targetId,
    PROJECTILE_STATUS.DESPAWNED
  );
};

Projectile.prototype.update = function(actors) {
  const target = actors.find(({ id }) => id === this.targetId);

  if (!target || target.status === ACTOR_STATUS.DEAD) {
    return this.despawn();
  }

  return new Projectile(
    this.type,
    this.pos,
    this.targetId,
    PROJECTILE_STATUS.REACHED_TARGET
  );
};
