import { Actor } from './actor.js';
import { Timer } from '../utils/timer.js';

export class Spawn {
  constructor(type, remainingCount, timer, actors = []) {
    this.type = type;
    this.remainingCount = remainingCount;
    this.timer = timer;
    this.actors = actors;
  }

  static create(type, remainingCount, timeBetweenSpawns) {
    return new Spawn(type, remainingCount, Timer.start(timeBetweenSpawns));
  }
}

Spawn.prototype.update = function(time, { path }) {
  if (this.remainingCount < 1) return this;

  let timer = this.timer.update(time);

  const isOnCooldown = !timer.hasExpired;
  if (isOnCooldown) {
    return new Spawn(this.type, this.remainingCount, timer, this.actors);
  }

  const actor = Actor.create(this.type, path.start.pos, path.start.next);
  const actorsToSpawn = [...this.actors, actor];
  timer = timer.reset();

  return new Spawn(this.type, this.remainingCount - 1, timer, actorsToSpawn);
};

Spawn.prototype.resetActorQueue = function() {
  if (!this.actors || !this.actors.length) return this;

  return new Spawn(this.type, this.remainingCount, this.timer);
};
