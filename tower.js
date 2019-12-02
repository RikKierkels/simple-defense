import { Vector } from './vector.js';
import { Timer } from './timer.js';

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
  constructor(type, pos, timer = null, targetId = null) {
    this.type = type;
    this.cost = TOWERS[type].cost;
    this.range = TOWERS[type].range;
    this.size = TOWERS[type].size;
    this.pos = pos;
    this.timer = timer ? timer : Timer.start(TOWERS[type].fireRate);
    this.targetId = targetId;
  }
}

Tower.prototype.update = function(time, actors) {
  let timer = this.timer.update(time);

  const isReadyToFire = this.timer.hasExpired;
  if (!isReadyToFire) {
    return new Tower(this.type, this.pos, timer);
  }

  const targetId = this.findClosestActor(actors);
  return new Tower(this.type, this.pos, timer, targetId);
};

Tower.prototype.findClosestActor = function(actors) {
  let closest;
  let shortestDistance = Number.MAX_VALUE;

  const calculateDistance = (towerPos, actorPos) => {
    const diffX = towerPos.x - actorPos.x;
    const diffY = towerPos.y - actorPos.y;
    return Math.pow(diffX, 2) + Math.pow(diffY, 2);
  };

  for (const actor of actors) {
    const distanceToActor = calculateDistance(this.pos, actor.pos);

    if (distanceToActor < shortestDistance) {
      closest = actor;
      shortestDistance = distanceToActor;
    }
  }

  return closest;
};
