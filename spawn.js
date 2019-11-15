import { Actor } from './actor.js';

export class Spawn {
  constructor(type, remainingCount, timer, queue = []) {
    this.type = type;
    this.remainingCount = remainingCount;
    this.timer = timer;
    this.queue = queue;
  }

  static create(type, remainingCount, timeBetweenSpawns) {
    return new Spawn(type, remainingCount, new Timer(timeBetweenSpawns));
  }
}

Spawn.prototype.update = function(time, level) {
  if (this.remainingCount < 1) return this;

  let timer = this.timer.update(time);

  const isSpawnOnCooldown = !timer.hasExpired;
  if (isSpawnOnCooldown) {
    return new Spawn(this.type, this.remainingCount, timer, this.queue);
  }

  const actor = Actor.create(
    this.type,
    level.path.start.pos,
    level.path.start.pos.next
  );
  spawnTimer = timer.reset();

  return new Spawn(this.type, this.remainingCount - 1, timer, [
    ...this.queue,
    actor
  ]);
};

Spawn.prototype.resetQueue = function() {
  return new Spawn(this.type, this.remainingCount, this.timer);
};
