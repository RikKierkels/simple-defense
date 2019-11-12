import { Vector } from './vector.js';

const actors = {
  goblin: { health: 200, size: { x: 1, y: 1 }, speed: { x: 2, y: 2 } }
};

export class Actor {
  constructor(type, pos, goal) {
    const health = actors[type].health;
    const speed = actors[type].speed;
    const size = actors[type].size;

    this.type = type;
    this.health = health;
    this.pos = pos;
    this.size = size;
    this.speed = speed;
    this.goal = goal;
  }

  static create(type, pos, goal) {
    return new Actor(type, pos, goal);
  }

  static createFor(count, type, startNode) {
    const actors = [];
    for (let i = 0; i < count; i++) {
      actors.push(Actor.create(type, startNode.pos, startNode.next));
    }
    return actors;
  }
}

Actor.prototype.update = function(time, state) {
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
  let speed = 0;
  if (direction === 'right') {
    speed += this.speed.x;
  } else {
    speed -= this.speed.x;
  }

  const distanceTravelled = new Vector(speed * time, 0);
  let newPos = this.pos.plus(distanceTravelled);

  const hasReachedGoal =
    (direction === 'right' && newPos.x > xNext) ||
    (direction === 'left' && newPos.x < xNext);

  let nextGoal = this.goal;
  if (hasReachedGoal) {
    newPos = new Vector(xNext, newPos.y);
    nextGoal = this.goal.next;
  }

  return new Actor(this.type, newPos, nextGoal);
};

Actor.prototype.moveVertically = function(direction, yNext, time) {
  let speed = 0;
  if (direction === 'down') {
    speed += this.speed.y;
  } else {
    speed -= this.speed.y;
  }

  const distanceTravelled = new Vector(0, speed * time);
  let newPos = this.pos.plus(distanceTravelled);

  const hasReachedGoal =
    (direction === 'down' && newPos.y > yNext) ||
    (direction === 'up' && newPos.y < yNext);

  let nextGoal = this.goal;
  if (hasReachedGoal) {
    newPos = new Vector(newPos.x, yNext);
    nextGoal = this.goal.next;
  }

  return new Actor(this.type, newPos, nextGoal);
};
