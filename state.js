import { ACTOR_STATUS, MOUSE_BUTTON } from './const.js';

const STARTING_LIVES = 100;
const STARTING_MONEY = 200;

export class State {
  constructor(
    level,
    spawns,
    actors = [],
    lives = STARTING_LIVES,
    money = STARTING_MONEY
  ) {
    this.level = level;
    this.spawns = spawns;
    this.actors = actors;
    this.lives = lives;
    this.money = money;
  }

  static start(level, spawns) {
    return new State(level, spawns);
  }
}

State.prototype.update = function(time, userInput) {
  let spawns = this.spawns.map(spawn => spawn.update(time, this.level));
  let actors = spawns
    .map(({ queue }) => queue)
    .flat()
    .concat(this.actors);
  spawns = spawns.map(spawn => spawn.resetQueue());

  actors = actors.map(actor => actor.update(time, this));

  const actorCount = actors.reduce(
    (acc, { status }) => {
      acc[status]++;
      return acc;
    },
    {
      alive: 0,
      dead: 0,
      survived: 0
    }
  );

  const lives = this.lives - actorCount.survived;
  actors = actors.filter(({ status }) => status !== ACTOR_STATUS.SURVIVED);

  return new State(this.level, spawns, actors, lives);
};
