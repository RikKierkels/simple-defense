export const DIRECTION = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3
};

export const MOUSE_BUTTON = {
  LEFT: 0,
  RIGHT: 2
};

export const KEY = {
  ESCAPE: 'Escape'
};

export const TILE_TYPE = {
  EMPTY: '.',
  PATH: '#',
  START: 'S',
  END: 'E',
  OBSTACLE: '@'
};

export const ACTOR_TYPE = {
  GOBLIN: 100,
  ORC: 101
};

export const TOWER_TYPE = {
  MACHINE_GUN: 200,
  ROCKET_LAUNCHER: 201
};

export const PROJECTILE_TYPE = {
  BULLET: 300,
  ROCKET: 301
};

export const ACTOR_STATUS = {
  ALIVE: 0,
  DEAD: 1,
  SURVIVED: 2
};

export const PROJECTILE_STATUS = {
  MOVING_TO_TARGET: 0,
  DESPAWNED: 1,
  REACHED_TARGET: 2
};
