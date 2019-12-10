import {
  ACTOR_STATUS,
  PROJECTILE_STATUS,
  GAME_STATUS
} from '../utils/constants.js';
import { TOWERS, Tower } from '../entities/tower.js';
import { Vector } from '../utils/vector.js';
import { DisplayState } from './display-state.js';

const STARTING_LIVES = 10;
const STARTING_MONEY = 200;

export class State {
  constructor(
    level,
    spawns = [],
    actors = [],
    towers = [],
    projectiles = [],
    lives = STARTING_LIVES,
    money = STARTING_MONEY,
    display = new DisplayState(null),
    status = GAME_STATUS.PLAYING
  ) {
    this.level = level;
    this.spawns = spawns;
    this.actors = actors;
    this.towers = towers;
    this.projectiles = projectiles;
    this.lives = lives;
    this.money = money;
    this.display = display;
    this.status = status;
  }

  static start(level) {
    return new State(level);
  }
}

State.prototype.reset = function() {
  return State.start(this.level);
};

State.prototype.addSpawns = function(spawns) {
  return new State(
    this.level,
    spawns,
    this.actors,
    this.towers,
    this.projectiles,
    this.lives,
    this.money,
    this.display,
    this.status
  );
};

State.prototype.update = function(time, input) {
  let display = this.display.syncInput(input);

  let spawns = this.spawns.map(spawn => spawn.update(time, this.level.path));
  let actors = spawns
    .map(({ actorsToSpawn }) => actorsToSpawn)
    .flat()
    .concat(this.actors);
  actors = actors.map(actor => actor.update(time));

  let money = actors
    .filter(({ status }) => status === ACTOR_STATUS.DEAD)
    .reduce((total, { reward }) => total + reward, this.money);

  const lives = actors
    .filter(({ status }) => status === ACTOR_STATUS.SURVIVED)
    .reduce((total, _) => (total > 0 ? total - 1 : total), this.lives);
  const status = lives > 0 ? GAME_STATUS.PLAYING : GAME_STATUS.LOST;

  actors = actors.filter(({ status }) => status === ACTOR_STATUS.ALIVE);
  spawns = spawns.map(spawn => spawn.resetActorsToSpawn());

  let towers = this.towers;
  const { tile } = input.target;
  const hasTriedBuildingTower = display.isBuilding && tile;
  if (
    hasTriedBuildingTower &&
    this.canBuildTower(display.selectedTowerType, tile, this.money)
  ) {
    const { x, y } = tile;
    const tower = new Tower(display.selectedTowerType, new Vector(x, y));
    display = this.display.clear();
    money = money - tower.cost;
    towers = [...towers, tower];
  }

  towers = towers.map(tower => tower.update(time, actors));

  let projectiles = towers
    .filter(tower => tower.hasTarget)
    .map(tower => tower.fire())
    .concat(this.projectiles)
    .map(projectile => projectile.update(time, actors));

  towers = towers.map(tower => tower.resetTarget());

  actors = actors.map(actor => {
    const damage = projectiles
      .filter(({ status }) => status === PROJECTILE_STATUS.REACHED_TARGET)
      .filter(({ targetId }) => targetId === actor.id)
      .reduce((total, { damage }) => total + damage, 0);
    return actor.takeDamage(damage);
  });

  projectiles = projectiles.filter(
    ({ status }) => status === PROJECTILE_STATUS.MOVING_TO_TARGET
  );

  return new State(
    this.level,
    spawns,
    actors,
    towers,
    projectiles,
    lives,
    money,
    display,
    status
  );
};

State.prototype.canBuildTower = function(type, pos, money) {
  const isTileEmpty =
    !this.level.isTileBlocked(pos.x, pos.y) &&
    !this.towers.some(
      ({ pos: towerPos }) => towerPos.x === pos.x && towerPos.y === pos.y
    );
  const canAffordTower = TOWERS[type].cost <= money;

  return isTileEmpty && canAffordTower;
};
