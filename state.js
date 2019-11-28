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
    display = { towerToBuild: null, selectedTower: null }
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

State.prototype.update = function(time, userInput, mouseTarget) {
  let displayState = this.setDisplayState(userInput, mouseTarget);
  let spawns = this.spawns.map(spawn => spawn.update(time, this.level));
  let actors = spawns
    .map(({ actors }) => actors)
    .flat()
    .concat(this.actors);
  actors = actors.map(actor => actor.update(time));

  const money = actors
    .filter(({ status }) => status === ACTOR_STATUS.DEAD)
    .reduce((total, { reward }) => total + reward, this.reward);

  const lives = actors
    .filter(({ status }) => status === ACTOR_STATUS.SURVIVED)
    .reduce((total, _) => (total > 0 ? total - 1 : total), this.lives);

  actors = actors.filter(({ status }) => status === ACTOR_STATUS.ALIVE);
  spawns = spawns.map(spawn => spawn.resetActorQueue());

  return new State(this.level, spawns, actors, lives, money, displayState);
};

State.prototype.setDisplayState = function(userInput, mouseTarget) {
  if (!mouseTarget.panelTower && !mouseTarget.tile) {
    return this.display;
  }

  console.log(this.display);
  if (!this.display.towerToBuild) {
    return { ...this.display, towerToBuild: mouseTarget.panelTower };
  }

  const hasCancelled =
    userInput.buttonStates[MOUSE_BUTTON.RIGHT] ||
    userInput.buttonStates[KEY.ESCAPE];

  if (hasCancelled) {
    return { ...this.display, towerToBuild: null };
  }

  const hasClicked = userInput.buttonStates[MOUSE_BUTTON.LEFT];

  if (hasClicked) {
    console.log('HAS TRIED BUILDING TOWER AT POSITION', mouseTarget.tile);
  }

  return { ...this.display, towerToBuild: this.display.towerToBuild };
};
