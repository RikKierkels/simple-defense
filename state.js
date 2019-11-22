import { ACTOR_STATUS, MOUSE_BUTTON, KEY } from './const.js';

const STARTING_LIVES = 100;
const STARTING_MONEY = 200;

export class State {
  constructor(
    level,
    spawns,
    actors = [],
    lives = STARTING_LIVES,
    money = STARTING_MONEY,
    display = { towerToBuild: null }
  ) {
    this.level = level;
    this.spawns = spawns;
    this.actors = actors;
    this.lives = lives;
    this.money = money;
    this.display = display;
  }

  static start(level, spawns) {
    return new State(level, spawns);
  }
}

State.prototype.update = function(time, userInput) {
  let canvas = this.setDisplayState(userInput);
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

  return new State(this.level, spawns, actors, lives, money, canvas);
};

State.prototype.setDisplayState = function(userInput) {
  if (!userInput.mouseTarget && !this.display.towerToBuild) {
    return this.display;
  }

  if (!this.display.towerToBuild) {
    return { ...this.display, towerToBuild: userInput.mouseTarget };
  }

  const hasCancelledBuilding =
    userInput.buttonStates[MOUSE_BUTTON.RIGHT] ||
    userInput.buttonStates[KEY.ESCAPE];

  if (hasCancelledBuilding) {
    return { ...this.display, towerToBuild: null };
  }

  const hasTriedBuildingTower = userInput.buttonStates[MOUSE_BUTTON.LEFT];
  return { ...this.display, towerToBuild: this.display.towerToBuild };
};
