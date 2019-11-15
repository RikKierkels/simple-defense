import { ACTOR_STATUS } from './const.js';

export class State {
  constructor(level, spawns, actors, lives) {
    this.level = level;
    this.spawns = spawns;
    this.actors = actors;
    this.lives = lives;
  }

  static start(level, spawns) {
    return new State(level, spawns, [], 100000);
  }
}

State.prototype.update = function(time) {
  let spawns = this.spawns.map(spawn => spawn.update(time, this.level));
  let actors = spawns
    .map(({ queue }) => queue)
    .flat()
    .concat(this.actors);
  spawns = spawns.map(spawn => spawn.resetQueue());

  actors = actors.map(actor => actor.update(time, this));

  const survived = actors.filter(
    ({ status }) => status === ACTOR_STATUS.SURVIVED
  );
  const lives = this.lives - survived.length;
  actors = actors.filter(({ status }) => status !== ACTOR_STATUS.SURVIVED);

  return new State(this.level, spawns, actors, lives);
};
