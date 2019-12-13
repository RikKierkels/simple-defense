export const GAME_STATUS = {
  PLAYING: 0,
  LOST: 1,
  WON: 2
};

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
  SOLDIER: 'soldier',
  TANK: 'tank'
};

export const TOWER_TYPE = {
  MACHINE_GUN: 'machine-gun',
  ROCKET_LAUNCHER: 'rocket-launcher'
};

export const PROJECTILE_TYPE = {
  BULLET: 'bullet',
  ROCKET: 'rocket'
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

export const FONT_SIZE_RATIO = {
  LARGE: 1.5,
  MEDIUM: 1,
  SMALL: 0.75
};

export const FONT_COLOR = {
  LIGHT: 'white',
  DARK: 'black'
};
