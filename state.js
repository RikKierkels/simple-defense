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
  let spawns = this.spawns.map(spawn => spawn.update(time, this.level));
  const newActors = spawns.map(({ queue }) => queue).flat();
  spawns = spawns.map(spawn => spawn.resetQueue());

  let actors = this.actors.concat(newActors);
  actors = actors.map(actor => actor.update(time, this));

  const survived = actors.filter(({ status }) => status === 'survived');
  const lives = this.lives - survived.length;

  actors = actors.filter(({ status }) => status !== 'survived');

  return new State(this.level, spawns, actors, lives);
};
