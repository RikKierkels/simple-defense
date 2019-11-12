import { Actor, actorTypes } from './actor.js';

export class State {
  constructor(level, spawns, actors, lives, ticks) {
    this.level = level;
    this.spawns = spawns;
    this.actors = actors;
    this.lives = lives;
    this.ticks = ticks;
  }

  static start(level, spawns) {
    return new State(level, spawns, [], 20, 0);
  }
}

State.prototype.update = function(time) {
  let ticks = this.ticks + 1;

  const { actors: spawnedActors, spawns } = this.spawnActors(ticks);

  let actors = this.actors.concat(spawnedActors);
  actors = actors.map(actor => actor.update(time, this));

  const survived = actors.filter(({ status }) => status === 'survived');
  const lives = this.lives - survived.length;

  actors = actors.filter(({ status }) => status !== 'survived');

  return new State(this.level, spawns, actors, lives, ticks);
};

State.prototype.spawnActors = function(ticks) {
  const actors = [];

  for (let spawn of this.spawns) {
    const spawnRate = actorTypes[spawn.type].spawnRate;

    if (spawn.count === 0 || ticks % spawnRate !== 0) continue;

    const startNode = this.level.path.start;
    const actor = Actor.create(spawn.type, startNode.pos, startNode.next);
    actors.push(actor);
  }

  const spawns = this.spawns.map(spawn => {
    const hasSpawnedActor = actors.some(actor => actor.type === spawn.type);
    return hasSpawnedActor ? { ...spawn, count: spawn.count - 1 } : spawn;
  });

  return { actors, spawns };
};
