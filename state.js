import { Actor, actorTypes } from './actor.js';

export class State {
  constructor(level, spawns, actors, lives) {
    this.level = level;
    this.spawns = spawns;
    this.actors = actors;
    this.lives = lives;
  }

  static start(level, spawns) {
    return new State(level, spawns, [], 20);
  }
}

State.prototype.update = function(time) {
  const waves = this.waves.map(wave => wave.update(time, level));

  let actors = this.actors.concat(spawnedActors);
  actors = actors.map(actor => actor.update(time, this));

  const survived = actors.filter(({ status }) => status === 'survived');
  const lives = this.lives - survived.length;

  actors = actors.filter(({ status }) => status !== 'survived');

  return new State(this.level, spawns, actors, lives, ticks);
};

State.prototype.spawnActors = function(time, level) {
  const actors = [];
  for (let wave of waves) {
    if (!wave.spawnQueue || !wave.spawnQueue.length) continue;

    actors.concat(wave.spawnQueue);
    //TODO: Refactor spawnqueu
    wave = wave.resetSpawnQueue();
  }
  return actors;
};
