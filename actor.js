import { Vector } from './vector.js';

export const actorTypes = {
  goblin: {
    health: 200,
    size: { x: 1, y: 1 },
    speed: { x: 100, y: 100 },
    spawnRate: 20
  }
};

export class Actor {
  constructor(type, pos, goal, status = 'alive') {
    const health = actorTypes[type].health;
    const speed = actorTypes[type].speed;
    const size = actorTypes[type].size;

    this.type = type;
    this.health = health;
    this.pos = pos;
    this.size = size;
    this.speed = speed;
    this.goal = goal;
    this.status = status;
  }

  static create(type, pos, goal) {
    return new Actor(type, pos, goal);
  }
}

Actor.prototype.update = function(time, state) {
  if (!this.goal.next) {
    return new Actor(this.type, this.pos, this.goal, 'survived');
  }

  const { x: xCurrent, y: yCurrent } = this.pos;
  const { x: xNext, y: yNext } = this.goal.pos;

  let direction;
  if (xNext < xCurrent || xNext > xCurrent) {
    direction = xNext < xCurrent ? 'left' : 'right';
  } else {
    direction = yNext < yCurrent ? 'up' : 'down';
  }

  return direction === 'left' || direction === 'right'
    ? this.moveHorizontally(direction, xNext, time)
    : this.moveVertically(direction, yNext, time);
};

Actor.prototype.moveHorizontally = function(direction, xNext, time) {
  const speed = direction === 'right' ? this.speed.x : this.speed.x * -1;

  const distanceTravelled = new Vector(speed, 0).times(time);
  let newPos = this.pos.plus(distanceTravelled);

  let nextGoal = this.goal;
  const hasReachedGoal =
    (direction === 'right' && newPos.x > xNext) ||
    (direction === 'left' && newPos.x < xNext);

  if (hasReachedGoal) {
    newPos = new Vector(xNext, newPos.y);
    nextGoal = this.goal.next;
  }

  return new Actor(this.type, newPos, nextGoal, this.status);
};

Actor.prototype.moveVertically = function(direction, yNext, time) {
  const speed = direction === 'down' ? this.speed.y : this.speed.y * -1;

  const distanceTravelled = new Vector(0, speed).times(time);
  let newPos = this.pos.plus(distanceTravelled);

  let nextGoal = this.goal;
  const hasReachedGoal =
    (direction === 'down' && newPos.y > yNext) ||
    (direction === 'up' && newPos.y < yNext);

  if (hasReachedGoal) {
    newPos = new Vector(newPos.x, yNext);
    nextGoal = this.goal.next;
  }

  return new Actor(this.type, newPos, nextGoal, this.status);
};
