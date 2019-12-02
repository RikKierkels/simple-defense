import { ACTOR_STATUS } from './const.js';
import { Tower } from './tower.js';
import { Vector } from './vector.js';
import { DisplayState } from './display-state.js';

const STARTING_LIVES = 100;
const STARTING_MONEY = 200;

export class State {
  constructor(
    level,
    spawns,
    actors = [],
    towers = [],
    projectiles = [],
    lives = STARTING_LIVES,
    money = STARTING_MONEY,
    display = new DisplayState(null)
  ) {
    this.level = level;
    this.spawns = spawns;
    this.actors = actors;
    this.towers = towers;
    this.projectiles = projectiles;
    this.lives = lives;
    this.money = money;
    this.display = display;
  }

  static start(level, spawns) {
    return new State(level, spawns);
  }
}

State.prototype.update = function(time, userInput, clickedOn) {
  let spawns = this.spawns.map(spawn => spawn.update(time, this.level));
  let actors = spawns
    .map(({ actors }) => actors)
    .flat()
    .concat(this.actors);
  actors = actors.map(actor => actor.update(time));

  let money = actors
    .filter(({ status }) => status === ACTOR_STATUS.DEAD)
    .reduce((total, { status, reward }) => total + reward, this.money);

  const lives = actors
    .filter(({ status }) => status === ACTOR_STATUS.SURVIVED)
    .reduce((total, _) => (total > 0 ? total - 1 : total), this.lives);

  actors = actors.filter(({ status }) => status === ACTOR_STATUS.ALIVE);
  spawns = spawns.map(spawn => spawn.resetActorQueue());

  let display = this.display.syncInput(userInput, clickedOn);
  const newTower = this.buildTower(clickedOn.tile, money);
  let towers = newTower ? [...this.towers, newTower] : this.towers;

  if (newTower) {
    display = this.display.clear();
    money = money - newTower.cost;
  }

  towers = towers.map(tower => tower.update(time, actors));

  return new State(
    this.level,
    spawns,
    actors,
    towers,
    this.projectiles,
    lives,
    money,
    display
  );
};

State.prototype.buildTower = function(tile, money) {
  const towerType = this.display.typeOfTowerToBuild;
  if (!tile || !towerType) return;

  const isTileBlockedByLevel = this.level.isTileBlocked(tile.x, tile.y);
  const isTileBlockedByOtherTower = this.towers.some(
    ({ pos }) => pos.x === tile.x && pos.y === tile.y
  );

  if (isTileBlockedByLevel || isTileBlockedByOtherTower) {
    return;
  }

  const tower = new Tower(towerType, new Vector(tile.x, tile.y));
  return tower.cost <= money ? tower : null;
};
