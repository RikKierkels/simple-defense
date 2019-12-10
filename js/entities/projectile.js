import {
  DIRECTION,
  ACTOR_STATUS,
  PROJECTILE_TYPE,
  PROJECTILE_STATUS
} from '../utils/constants.js';
import { Vector } from './vector.js';

export const PROJECTILES = {
  [PROJECTILE_TYPE.BULLET]: {
    speed: 2,
    damage: 20
  },
  [PROJECTILE_TYPE.ROCKET]: {
    speed: 2.5,
    damage: 500
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
}

Projectile.prototype.despawn = function() {
  return new Projectile(
    this.type,
    this.pos,
    this.targetId,
    PROJECTILE_STATUS.DESPAWNED
  );
};

Projectile.prototype.update = function(time, actors) {
  const targetActor = actors.find(({ id }) => id === this.targetId);

  if (!targetActor || targetActor.status === ACTOR_STATUS.DEAD) {
    return this.despawn();
  }

  const hasReachedTarget = (negativeDirection, positiveDirection) => {
    return (direction, next, target, targetCenter) => {
      return (
        (direction === negativeDirection && next < target + targetCenter) ||
        (direction === positiveDirection && next > target - targetCenter)
      );
    };
  };

  const targetCenter = targetActor.size.times(0.5);
  const { x: currentX, y: currentY } = this.pos;
  const { x: targetX, y: targetY } = targetActor.pos.plus(targetCenter);

  const xDirection = targetX > currentX ? DIRECTION.RIGHT : DIRECTION.LEFT;
  const yDirection = targetY > currentY ? DIRECTION.DOWN : DIRECTION.UP;

  const xSpeed = xDirection === DIRECTION.RIGHT ? this.speed : this.speed * -1;
  const ySpeed = yDirection === DIRECTION.DOWN ? this.speed : this.speed * -1;

  const travelledDistance = new Vector(xSpeed, ySpeed).times(time);
  const nextPos = this.pos.plus(travelledDistance);

  const hasReachedTargetX = hasReachedTarget(DIRECTION.LEFT, DIRECTION.RIGHT);
  const hasReachedTargetY = hasReachedTarget(DIRECTION.UP, DIRECTION.DOWN);

  let status =
    hasReachedTargetX(xDirection, nextPos.x, targetX, targetCenter.x) &&
    hasReachedTargetY(yDirection, nextPos.y, targetY, targetCenter.y)
      ? PROJECTILE_STATUS.REACHED_TARGET
      : this.status;

  return new Projectile(this.type, nextPos, this.targetId, status);
};
