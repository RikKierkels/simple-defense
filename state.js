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
  if (userInput.target) {
    console.log(userInput.target);
  }

  let spawns = this.spawns.map(spawn => spawn.update(time, this.level));
  let actors = spawns
    .map(({ actors }) => actors)
    .flat()
    .concat(this.actors);
  actors = actors.map(actor => actor.update(time, this));

  const money = actors
    .filter(({ status }) => status === ACTOR_STATUS.DEAD)
    .reduce((total, { reward }) => total + reward, this.reward);

  const lives = actors
    .filter(({ status }) => status === ACTOR_STATUS.SURVIVED)
    .reduce((total, _) => total - 1, this.lives);

  actors = actors.filter(({ status }) => status === ACTOR_STATUS.ALIVE);
  spawns = spawns.map(spawn => spawn.resetActorQueue());

  return new State(this.level, spawns, actors, lives, money);
};
