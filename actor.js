import { Vector } from './vector.js';

const actors = {
  goblin: { health: 200, size: { x: 1, y: 1 }, speed: { x: 2, y: 2 } }
};

export class Actor {
  constructor(type, health, pos, size, speed) {
    this.type = type;
    this.health = health;
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }

  static create(type, pos) {
    const health = actors[type].health;
    const speed = actors[type].speed;
    const size = actors[type].size;

    return new Actor(
      type,
      health,
      pos,
      new Vector(size.x, size.y),
      new Vector(speed.x, speed.y)
    );
  }

  static createFor(type, count, pos) {
    const actors = [];
    for (let i = 0; i < count; i++) {
      actors.push(Actor.create(type, pos));
    }
    return actors;
  }
}

Actor.prototype.update = function(time, state) {
  const [, next, ...rest] = state.level.findPath(
    Math.floor(this.pos.x),
    Math.floor(this.pos.y)
  );
  const [nextX, nextY] = next;

  console.log('Moving from', this.pos.x, 'X to', nextX);
  console.log('Moving from', this.pos.y, 'Y to', nextY);

  let xSpeed = 0;
  let ySpeed = 0;
  if (nextX > Math.floor(this.pos.x)) {
    xSpeed += this.speed.x;
  } else if (nextX < Math.floor(this.pos.x)) {
    xSpeed -= this.speed.x;
  } else if (nextY > Math.floor(this.pos.y)) {
    ySpeed += this.speed.y;
  } else {
    ySpeed -= this.speed.y;
  }

  let newPos;
  if (xSpeed) {
    newPos = this.pos.plus(new Vector(xSpeed * time, 0));
  } else {
    newPos = this.pos.plus(new Vector(0, ySpeed * time));
  }

  return new Actor(this.type, this.health, newPos, this.size, this.speed);
};
