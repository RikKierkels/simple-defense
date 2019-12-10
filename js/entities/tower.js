import { Vector } from '../utils/vector.js';
import { Timer } from '../utils/timer.js';
import { PROJECTILE_TYPE, TOWER_TYPE } from '../utils/constants.js';
import { Projectile } from './projectile.js';

export const TOWERS = {
  [TOWER_TYPE.MACHINE_GUN]: {
    cost: 30,
    fireRate: 0.2,
    range: new Vector(2, 2),
    size: new Vector(1, 1),
    projectileType: PROJECTILE_TYPE.BULLET
  },
  [TOWER_TYPE.ROCKET_LAUNCHER]: {
    cost: 40,
    fireRate: 0.8,
    range: new Vector(4, 4),
    size: new Vector(1, 1),
    projectileType: PROJECTILE_TYPE.ROCKET
  }
};

export class Tower {
  constructor(type, pos, timer = null, targetId = null) {
    this.type = type;
    this.cost = TOWERS[type].cost;
    this.range = TOWERS[type].range;
    this.size = TOWERS[type].size;
    this.projectileType = TOWERS[type].projectileType;
    this.pos = pos;
    this.timer = timer ? timer : Timer.start(TOWERS[type].fireRate);
    this.targetId = targetId;
  }

  get hasTarget() {
    return this.targetId !== null;
  }
}

Tower.prototype.update = function(time, actors) {
  let timer = this.timer.update(time);

  const isReadyToFire = this.timer.hasExpired;
  if (!isReadyToFire) return new Tower(this.type, this.pos, timer);

  const target = this.findTarget(actors);
  if (!target) return new Tower(this.type, this.pos, timer);

  timer = timer.reset();
  return new Tower(this.type, this.pos, timer, target.id);
};

Tower.prototype.findTarget = function(actors) {
  let closest;
  let shortestDistance = Number.MAX_VALUE;

  const calculateDistance = (towerPos, actorPos) => {
    const diffX = towerPos.x - actorPos.x;
    const diffY = towerPos.y - actorPos.y;
    return Math.pow(diffX, 2) + Math.pow(diffY, 2);
  };

  const isWithinTowerRange = (actorX, actorY) => {
    const { x: towerX, y: towerY } = this.pos;
    const { x: rangeX, y: rangeY } = this.range;

    return (
      actorX <= towerX + rangeX &&
      actorX >= towerX - rangeX &&
      actorY <= towerY + rangeY &&
      actorY >= towerY - rangeY
    );
  };

  for (const actor of actors) {
    const distanceToActor = calculateDistance(this.pos, actor.pos);

    if (distanceToActor < shortestDistance) {
      closest = actor;
      shortestDistance = distanceToActor;
    }
  }

  return closest && isWithinTowerRange(closest.pos.x, closest.pos.y)
    ? closest
    : null;
};

Tower.prototype.fire = function() {
  return new Projectile(this.projectileType, this.pos, this.targetId);
};

Tower.prototype.resetTarget = function() {
  if (!this.target) return this;
  return new Tower(this.type, this.pos, this.timer, null);
};
