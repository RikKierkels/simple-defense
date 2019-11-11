import { Vector } from './vector.js';

const actors = {
  goblin: { health: 200, size: { x: 1, y: 1 }, speed: { x: 2, y: 2 } }
};

export class Actor {
  constructor(type, health, pos, size, speed, goal) {
    this.type = type;
    this.health = health;
    this.pos = pos;
    this.size = size;
    this.speed = speed;
    this.goal = goal;
  }

  static create(type, pos, goal) {
    const health = actors[type].health;
    const speed = actors[type].speed;
    const size = actors[type].size;

    return new Actor(
      type,
      health,
      pos,
      new Vector(size.x, size.y),
      new Vector(speed.x, speed.y),
      goal
    );
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

  let isMovingHorizontally, isReversed;
  if (xNext < xCurrent || xNext > xCurrent) {
    isMovingHorizontally = true;
    isReversed = xNext < xCurrent;
  } else {
    isMovingHorizontally = false;
    isReversed = yNext < yCurrent;
  }

  let speed = 0;
  if (isMovingHorizontally && isReversed) {
    speed -= this.speed.x;
  } else if (isMovingHorizontally && !isReversed) {
    speed += this.speed.x;
  } else if (!isMovingHorizontally && isReversed) {
    speed -= this.speed.y;
  } else {
    speed += this.speed.y;
  }

  let newPos;
  if (isMovingHorizontally) {
    newPos = this.pos.plus(new Vector(speed * time, 0));
  } else {
    newPos = this.pos.plus(new Vector(0, speed * time));
  }

  let goal = this.goal;
  if ((newPos.x < xNext && isReversed) || (newPos.x > xNext && !isReversed)) {
    newPos = new Vector(xNext, newPos.y);
    goal = this.goal.next;
  } else if (
    (newPos.y < yNext && isReversed) ||
    (newPos.y > yNext && !isReversed)
  ) {
    newPos = new Vector(newPos.x, yNext);
    goal = this.goal.next;
  }

  return new Actor(this.type, this.health, newPos, this.size, this.speed, goal);
};
