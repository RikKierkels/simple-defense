import { Actor } from './actor.js';
import { Timer } from '../utils/timer.js';

export class Spawn {
  constructor(type, count, timer, actorsToSpawn = []) {
    this.type = type;
    this.remainingCount = count;
    this.timer = timer;
    this.actorsToSpawn = actorsToSpawn;
  }

  get hasSpawnedAllActors() {
    return this.remainingCount < 1;
  }

  static create(type, remainingCount, timeBetweenSpawns) {
    return new Spawn(type, remainingCount, Timer.start(timeBetweenSpawns));
  }
}

Spawn.prototype.update = function(time, path) {
  if (this.hasSpawnedAllActors) return this;

  let timer = this.timer.update(time);

  const isOnCooldown = !timer.hasExpired;
  if (isOnCooldown) {
    return new Spawn(this.type, this.remainingCount, timer, this.actorsToSpawn);
  }

  const actor = Actor.create(this.type, path.start.pos, path.start.next);
  const actorsToSpawn = [...this.actorsToSpawn, actor];
  timer = timer.reset();

  return new Spawn(this.type, this.remainingCount - 1, timer, actorsToSpawn);
};

Spawn.prototype.resetActorsToSpawn = function() {
  if (!this.actorsToSpawn || !this.actorsToSpawn.length) return this;

  return new Spawn(this.type, this.remainingCount, this.timer);
};
