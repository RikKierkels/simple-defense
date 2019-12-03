import { ACTOR_STATUS, DIRECTION, ACTOR_TYPE } from './const.js';
import { Vector } from './vector.js';
import { generateId } from './util.js';

const ACTORS = {
  [ACTOR_TYPE.GOBLIN]: {
    health: 200,
    size: { x: 1, y: 1 },
    speed: { x: 2, y: 2 },
    reward: 20
  },
  [ACTOR_TYPE.ORC]: {
    health: 300,
    size: { x: 1, y: 1 },
    speed: { x: 2, y: 2 },
    reward: 30
  }
};

export class Actor {
  constructor(id, type, pos, goal, status = ACTOR_STATUS.ALIVE) {
    const health = ACTORS[type].health;
    const speed = ACTORS[type].speed;
    const size = ACTORS[type].size;
    const reward = ACTORS[type].reward;

    this.id = id;
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
    const id = generateId();
    return new Actor(id, type, pos, goal);
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

  return hasReachedGoal
    ? new Actor(this.id, this.type, this.goal.pos, this.goal.next, this.status)
    : new Actor(this.id, this.type, newPos, this.goal, this.status);
};

Actor.prototype.moveVertically = function(direction, yNext, time) {
  const speed = direction === DIRECTION.DOWN ? this.speed.y : this.speed.y * -1;

  const distanceTravelled = new Vector(0, speed).times(time);
  const newPos = this.pos.plus(distanceTravelled);

  const hasReachedGoal =
    (direction === DIRECTION.DOWN && newPos.y > yNext) ||
    (direction === DIRECTION.UP && newPos.y < yNext);

  // TODO: Refactor?
  return hasReachedGoal
    ? new Actor(this.id, this.type, this.goal.pos, this.goal.next, this.status)
    : new Actor(this.id, this.type, newPos, this.goal, this.status);
};

Actor.prototype.survived = function() {
  return new Actor(
    this.id,
    this.type,
    this.pos,
    this.goal,
    ACTOR_STATUS.SURVIVED
  );
};

Actor.prototype.died = function() {
  return new Actor(this.id, this.type, this.pos, this.goal, ACTOR_STATUS.DEAD);
};
