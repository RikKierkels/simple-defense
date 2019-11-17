import { Vector } from './vector.js';
import { ACTOR_STATUS, DIRECTION } from './const.js';

export const actorTypes = {
  goblin: {
    health: 200,
    size: { x: 1, y: 1 },
    speed: { x: 2, y: 2 },
    reward: 20
  },
  orc: {
    health: 300,
    size: { x: 1, y: 1 },
    speed: { x: 2, y: 2 },
    reward: 30
  }
};

export class Actor {
  constructor(type, pos, goal, status = ACTOR_STATUS.ALIVE) {
    const health = actorTypes[type].health;
    const speed = actorTypes[type].speed;
    const size = actorTypes[type].size;
    const reward = actorTypes[type].reward;

    this.type = type;
    this.health = health;
    this.pos = pos;
    this.size = new Vector(size.x, size.y);
    this.speed = new Vector(speed.x, speed.y);
    this.goal = goal;
    this.status = status;
    this.reward = reward;
  }

  static create(type, pos, goal) {
    return new Actor(type, pos, goal);
  }
}

Actor.prototype.update = function(time) {
  if (!this.goal.next) {
    return this.survived();
  }

  const { x: xCurrent, y: yCurrent } = this.pos;
  const { x: xNext, y: yNext } = this.goal.pos;

  let direction;
  if (xNext < xCurrent || xNext > xCurrent) {
    direction = xNext < xCurrent ? DIRECTION.LEFT : DIRECTION.RIGHT;
  } else {
    direction = yNext < yCurrent ? DIRECTION.UP : DIRECTION.DOWN;
  }

  return direction === DIRECTION.LEFT || direction === DIRECTION.RIGHT
    ? this.moveHorizontally(direction, xNext, time)
    : this.moveVertically(direction, yNext, time);
};

Actor.prototype.moveHorizontally = function(direction, xNext, time) {
  const speed =
    direction === DIRECTION.RIGHT ? this.speed.x : this.speed.x * -1;

  const distanceTravelled = new Vector(speed, 0).times(time);
  let newPos = this.pos.plus(distanceTravelled);

  const hasReachedGoal =
    (direction === DIRECTION.RIGHT && newPos.x > xNext) ||
    (direction === DIRECTION.LEFT && newPos.x < xNext);

  if (hasReachedGoal) {
    newPos = new Vector(xNext, newPos.y);
    return new Actor(this.type, newPos, this.goal.next, this.status);
  }

  return new Actor(this.type, newPos, this.goal, this.status);
};

Actor.prototype.moveVertically = function(direction, yNext, time) {
  const speed = direction === DIRECTION.DOWN ? this.speed.y : this.speed.y * -1;

  const distanceTravelled = new Vector(0, speed).times(time);
  let newPos = this.pos.plus(distanceTravelled);

  const hasReachedGoal =
    (direction === DIRECTION.DOWN && newPos.y > yNext) ||
    (direction === DIRECTION.UP && newPos.y < yNext);

  if (hasReachedGoal) {
    newPos = new Vector(newPos.x, yNext);
    return new Actor(this.type, newPos, this.goal.next, this.status);
  }

  return new Actor(this.type, newPos, this.goal, this.status);
};

Actor.prototype.survived = function() {
  return new Actor(this.type, this.pos, this.goal, ACTOR_STATUS.SURVIVED);
};

Actor.prototype.died = function() {
  return new Actor(this.type, this.pos, this.goal, ACTOR_STATUS.DEAD);
};
