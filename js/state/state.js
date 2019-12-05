import { ACTOR_STATUS, PROJECTILE_STATUS } from '../utils/constants.js';
import { TOWERS, Tower } from '../entities/tower.js';
import { Vector } from '../utils/vector.js';
import { DisplayState } from './display-state.js';
import { Projectile } from '../entities/projectile.js';

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

State.prototype.update = function(time, input) {
  let display = this.display.syncInput(input);
  let towers = this.towers;

  let spawns = this.spawns.map(spawn => spawn.update(time, this.level.path));
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

  const hasTriedBuildingTower = display.isBuilding && input.target.tile;
  if (
    hasTriedBuildingTower &&
    this.canBuildTower(display.selectedTowerType, input.target.tile, this.money)
  ) {
    const { x, y } = input.target.tile;
    const tower = new Tower(display.selectedTowerType, new Vector(x, y));
    display = this.display.clear();
    money = money - tower.cost;
    towers = [...towers, tower];
  }

  towers = towers.map(tower => tower.update(time, actors));
  let projectiles = towers
    .filter(({ targetId }) => targetId)
    .map(({ projectileType: type, pos, targetId }) =>
      Projectile.create(type, pos, targetId)
    )
    .concat(this.projectiles)
    .map(projectile => projectile.update(actors));
  towers = towers.map(tower => tower.resetTarget());

  actors = actors.map(actor => {
    const damage = projectiles
      .filter(({ status }) => status === PROJECTILE_STATUS.REACHED_TARGET)
      .filter(({ targetId }) => targetId === actor.id)
      .reduce((total, { damage }) => total + damage, 0);
    return actor.takeDamage(damage);
  });

  projectiles = projectiles.filter(
    ({ status }) => status !== PROJECTILE_STATUS.MOVING_TO_TARGET
  );

  return new State(
    this.level,
    spawns,
    actors,
    towers,
    projectiles,
    lives,
    money,
    display
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
