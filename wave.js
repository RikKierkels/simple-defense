export class Wave {
  constructor(type, spawnCount, spawnTimer, spawnQueue = []) {
    this.type = type;
    this.spawnCount = spawnCount;
    this.spawnTimer = spawnTimer;
    this.spawnQueue = spawnQueue;
  }

  static create(type, spawnCount, timeBetweenSpawns) {
    return new Wave(type, spawnCount, new Timer(timeBetweenSpawns));
  }
}

Wave.prototype.update = function(time, level) {
  if (this.spawnCount < 1) return this;

  let spawnTimer = this.spawnTimer.update(time);

  if (!spawnTimer.hasExpired) {
    const actor = Actor.create(
      this.type,
      level.path.start.pos,
      level.path.start.pos.next
    );
    spawnTimer = spawnTimer.reset();

    return new Wave(this.type, this.spawnCount - 1, spawnTimer, [
      ...this.spawnQueue,
      actor
    ]);
  }

  return new Wave(this.type, this.spawnCount, spawnTimer, this.spawnQueue);
};

Wave.prototype.resetSpawnQueue = function() {
  return new Wave(this.type, this.spawnCount, this.spawnTimer);
};
