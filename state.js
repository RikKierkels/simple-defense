import { ACTOR_STATUS, MOUSE_BUTTON, KEY } from './const.js';
import { canBuyTower } from './tower.js';
import { Tower } from './tower.js';
import { Vector } from './vector.js';

const STARTING_LIVES = 100;
const STARTING_MONEY = 200;

export class State {
  constructor(
    level,
    spawns,
    actors = [],
    towers = [],
    lives = STARTING_LIVES,
    money = STARTING_MONEY,
    display = { towerToBuild: null }
  ) {
    this.level = level;
    this.spawns = spawns;
    this.actors = actors;
    this.towers = towers;
    this.lives = lives;
    this.money = money;
    this.display = display;
  }

  static start(level, spawns) {
    return new State(level, spawns);
  }
}

State.prototype.update = function(time, userInput, clickedOn) {
  let displayState = this.getDisplayState(userInput, clickedOn);
  const newTower = this.buildTower(clickedOn.tile);

  if (newTower) {
    displayState = { towerToBuild: null };
  }

  const towers = newTower ? [...this.towers, newTower] : this.towers;

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

  return new State(
    this.level,
    spawns,
    actors,
    towers,
    lives,
    money,
    displayState
  );
};

// TODO: REFACTOR TO CLASS WITH DISPLAY STATE
State.prototype.getDisplayState = function(userInput, clickedOn) {
  const isBuildingTower = this.display.towerToBuild !== null;

  return isBuildingTower
    ? this.getDisplayStateWhileBuildingTower(userInput)
    : this.getDisplayStateForBuildingTower(userInput, clickedOn);
};

State.prototype.getDisplayStateWhileBuildingTower = function(userInput) {
  const hasCancelled =
    userInput.buttonStates[KEY.ESCAPE] ||
    userInput.buttonStates[MOUSE_BUTTON.RIGHT];

  return hasCancelled ? { towerToBuild: null } : this.display;
};

State.prototype.getDisplayStateForBuildingTower = function(
  userInput,
  clickedOn
) {
  if (!clickedOn.panelTower) {
    return { towerToBuild: null };
  }

  return canBuyTower(clickedOn.panelTower, this.money)
    ? { towerToBuild: clickedOn.panelTower }
    : { towerToBuild: null };
};

State.prototype.buildTower = function(tile) {
  if (!tile) return;

  const isTileBlockedByLevel = this.level.isTileBlocked(tile.x, tile.y);
  const isTileBlockedByOtherTower = this.towers.some(
    ({ pos }) => pos.x === tile.x && pos.y === tile.y
  );

  if (isTileBlockedByLevel || isTileBlockedByOtherTower) {
    return;
  }

  console.log(this.display.towerToBuild);
  return new Tower(this.display.towerToBuild, new Vector(tile.x, tile.y));
};
