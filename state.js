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
  const spawns = this.spawns.map(wave => wave.update(time, this.level));
  const spawnedActors = this.spawnActors(spawns);

  let actors = this.actors.concat(spawnedActors);
  actors = actors.map(actor => actor.update(time, this));

  const survived = actors.filter(({ status }) => status === 'survived');
  const lives = this.lives - survived.length;

  actors = actors.filter(({ status }) => status !== 'survived');

  return new State(this.level, spawns, actors, lives);
};

State.prototype.spawnActors = function(spawns) {
  const actors = [];

  for (let i = 0; i < spawns.length; i++) {
    let spawn = spawns[i];
    if (!spawn.queue || !spawn.queue.length) continue;

    actors.concat(spawn.queue);
    spawn = spawn.resetQueue();
  }

  return actors;
};
