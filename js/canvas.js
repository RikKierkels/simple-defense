import {
  MOUSE_BUTTON,
  ACTOR_TYPE,
  TOWER_TYPE,
  TILE_TYPE,
  GAME_STATUS,
  DIRECTION,
  PROJECTILE_TYPE,
  FONT_COLOR,
  FONT_SIZE_RATIO
} from './utils/constants.js';
import { Vector } from './utils/vector.js';
import { TOWERS } from './entities/tower.js';
import { CanvasCache } from './state/canvas-cache.js';

const SCALE = 35;
const SPRITESHEET = document.createElement('img');
SPRITESHEET.src = './img/spritesheet.png';

const SPRITE_SIZE = 128;
const SPRITESHEET_OFFSETS = {
  [TILE_TYPE.EMPTY]: { x: 2432, y: 768 },
  [TILE_TYPE.START]: { x: 2816, y: 768 },
  [TILE_TYPE.END]: { x: 2816, y: 768 },
  [TILE_TYPE.PATH]: { x: 2816, y: 768 },
  [TILE_TYPE.OBSTACLE]: { x: 128, y: 512 },

  [ACTOR_TYPE.SOLDIER]: { x: 1920, y: 1280 },
  [ACTOR_TYPE.TANK]: { x: 1920, y: 1408 },

  [TOWER_TYPE.MACHINE_GUN]: { x: 2432, y: 1280 },
  [TOWER_TYPE.ROCKET_LAUNCHER]: { x: 2560, y: 1024 },

  [PROJECTILE_TYPE.BULLET]: { x: 2432, y: 1408 },
  [PROJECTILE_TYPE.ROCKET]: { x: 2688, y: 1280 }
};

const PANEL_TOWER_SIZE = SCALE * 2;
const PANEL_MARGIN = SCALE * 0.75;
const PANEL_WIDTH = SCALE * 4;
const DEFAULT_FONT_FAMILY = 'Georgia';

export class CanvasDisplay {
  constructor(parent, level) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = level.width * SCALE + PANEL_WIDTH;
    this.canvas.height = level.height * SCALE;
    parent.appendChild(this.canvas);
    this.context = this.canvas.getContext('2d');
    this.cache = CanvasCache.create();
  }

  get backgroundWidth() {
    return this.canvas.width - PANEL_WIDTH;
  }
}

CanvasDisplay.prototype.syncState = function(state, input) {
  this.drawBackground(state.level);
  this.drawTowers(state.towers);
  this.drawActors(state.actors);
  this.drawProjectiles(state.projectiles);
  this.drawPanel();
  this.drawStatistics(state.lives, state.money);
  this.drawTowerPreview(state.level, input, state.display);

  if (state.status === GAME_STATUS.LOST) {
    this.drawGameOver();
  }
};

CanvasDisplay.prototype.drawBackground = function(level) {
  const xStart = 0;
  const xEnd = this.backgroundWidth / SCALE;
  const yStart = 0;
  const yEnd = this.canvas.height / SCALE;

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      const tile = level.rows[y][x];
      const sprite = SPRITESHEET_OFFSETS[tile];

      this.context.drawImage(
        SPRITESHEET,
        sprite.x,
        sprite.y,
        SPRITE_SIZE,
        SPRITE_SIZE,
        x * SCALE,
        y * SCALE,
        SCALE,
        SCALE
      );
    }
  }
};

CanvasDisplay.prototype.drawTowers = function(towers) {
  for (const tower of towers) {
    const width = tower.size.x * SCALE;
    const height = tower.size.y * SCALE;
    const sprite = SPRITESHEET_OFFSETS[tower.type];

    this.context.drawImage(
      SPRITESHEET,
      sprite.x,
      sprite.y,
      SPRITE_SIZE,
      SPRITE_SIZE,
      tower.pos.x * SCALE,
      tower.pos.y * SCALE,
      width,
      height
    );
  }
};

CanvasDisplay.prototype.drawActors = function(actors) {
  for (const actor of actors) {
    const { type, direction, size } = actor;

    let canvas = this.cache.get(type, direction);
    if (!canvas) {
      canvas = this.createCanvasWithRotatedSprite(type, size, direction);
      this.cache = this.cache.set(type, direction, canvas);
    }

    this.context.drawImage(canvas, actor.pos.x * SCALE, actor.pos.y * SCALE);
  }
};

CanvasDisplay.prototype.createCanvasWithRotatedSprite = function(
  type,
  size,
  direction
) {
  const sprite = SPRITESHEET_OFFSETS[type];
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  let angle = 0;
  if (direction === DIRECTION.DOWN) {
    angle = 90;
  } else if (direction === DIRECTION.LEFT) {
    angle = 180;
  } else if (direction === DIRECTION.UP) {
    angle = 270;
  }

  const translateByPx = SCALE / 2;
  context.translate(translateByPx, translateByPx);
  context.rotate((angle * Math.PI) / 180);
  context.translate(-translateByPx, -translateByPx);

  context.drawImage(
    SPRITESHEET,
    sprite.x,
    sprite.y,
    SPRITE_SIZE,
    SPRITE_SIZE,
    0,
    0,
    size.x * SCALE,
    size.y * SCALE
  );

  return canvas;
};

CanvasDisplay.prototype.drawProjectiles = function(projectiles) {
  for (const projectile of projectiles) {
    const sprite = SPRITESHEET_OFFSETS[projectile.type];

    this.context.drawImage(
      SPRITESHEET,
      sprite.x,
      sprite.y,
      SPRITE_SIZE,
      SPRITE_SIZE,
      projectile.pos.x * SCALE,
      projectile.pos.y * SCALE,
      SCALE,
      SCALE
    );
  }
};

CanvasDisplay.prototype.drawPanel = function() {
  const xStart = this.backgroundWidth;
  const yStart = 0;

  this.context.fillStyle = 'black';
  this.context.fillRect(xStart, yStart, PANEL_WIDTH, this.canvas.height);

  this.mapTowersToPanelPositions(TOWERS).forEach(({ type, xStart, yStart }) => {
    const sprite = SPRITESHEET_OFFSETS[type];
    this.context.drawImage(
      SPRITESHEET,
      sprite.x,
      sprite.y,
      SPRITE_SIZE,
      SPRITE_SIZE,
      xStart,
      yStart,
      PANEL_TOWER_SIZE,
      PANEL_TOWER_SIZE
    );
  });
};

CanvasDisplay.prototype.mapTowersToPanelPositions = function(towers) {
  const xTowerOffset = (PANEL_WIDTH - PANEL_TOWER_SIZE) / 2;
  const yTowerOffset = PANEL_MARGIN;
  const xStart = this.backgroundWidth + xTowerOffset;
  const xEnd = xStart + PANEL_TOWER_SIZE;

  return Object.keys(towers).map((type, index) => {
    const margin = index % 2 ? PANEL_MARGIN : 0;
    const yStart = index * PANEL_TOWER_SIZE + margin + yTowerOffset;
    const yEnd = yStart + PANEL_TOWER_SIZE;

    return {
      type,
      xStart,
      xEnd,
      yStart,
      yEnd
    };
  });
};

CanvasDisplay.prototype.drawStatistics = function(lives, money) {
  const fontSize = FONT_SIZE_RATIO.MEDIUM * SCALE;
  console.log(fontSize);
  this.context.font = `${fontSize}px ${DEFAULT_FONT_FAMILY}`;
  this.context.fillStyle = FONT_COLOR.LIGHT;

  const livesTextWidth = this.context.measureText(lives).width;

  this.context.fillText(lives, SCALE, this.canvas.height - SCALE);
  this.context.fillText(
    `$${money}`,
    livesTextWidth + SCALE * 2,
    this.canvas.height - SCALE
  );
};

CanvasDisplay.prototype.drawTowerPreview = function(level, input, display) {
  let { mouseX, mouseY } = input;
  const hasMovedOutOfLevelBounds =
    mouseX > this.backgroundWidth || mouseY > this.canvas.height;

  if (!display.selectedTowerType || hasMovedOutOfLevelBounds) {
    return;
  }

  const tower = TOWERS[display.selectedTowerType];

  const scaledTowerSize = tower.size.times(SCALE);
  mouseX = mouseX - scaledTowerSize.x / 2;
  mouseY = mouseY - scaledTowerSize.y / 2;

  const nearestTileX = Math.round(mouseX / SCALE);
  const nearestTileY = Math.round(mouseY / SCALE);

  if (level.isTileBlocked(nearestTileX, nearestTileY)) return;

  const sprite = SPRITESHEET_OFFSETS[display.selectedTowerType];
  const tilePos = new Vector(nearestTileX, nearestTileY);
  this.context.drawImage(
    SPRITESHEET,
    sprite.x,
    sprite.y,
    SPRITE_SIZE,
    SPRITE_SIZE,
    tilePos.x * SCALE,
    tilePos.y * SCALE,
    scaledTowerSize.x,
    scaledTowerSize.y
  );

  const tileCenter = tilePos.plus(tower.size.times(0.5)).times(SCALE);
  const radius = tower.size
    .times(0.5)
    .plus(tower.range)
    .times(SCALE)
    .average();

  this.context.beginPath();
  this.context.arc(tileCenter.x, tileCenter.y, radius, 0, 2 * Math.PI);
  this.context.stroke();
};

CanvasDisplay.prototype.getClickTarget = function(userInput) {
  if (!userInput.buttonStates[MOUSE_BUTTON.LEFT]) {
    return { tower: null, tile: null };
  }

  const { mouseX, mouseY } = userInput;
  const hasClickedOnBackground = mouseX < this.backgroundWidth;

  return hasClickedOnBackground
    ? this.getClickedTileInBackground(mouseX, mouseY)
    : this.getClickedTowerInPanel(mouseX, mouseY);
};

CanvasDisplay.prototype.getClickedTileInBackground = function(mouseX, mouseY) {
  const tileX = Math.floor(mouseX / SCALE);
  const tileY = Math.floor(mouseY / SCALE);

  return { tile: { x: tileX, y: tileY }, tower: null };
};

CanvasDisplay.prototype.getClickedTowerInPanel = function(mouseX, mouseY) {
  const hasClickedOnTower = (mouseX, mouseY, xStart, xEnd, yStart, yEnd) => {
    return (
      mouseX >= xStart && mouseX <= xEnd && mouseY >= yStart && mouseY <= yEnd
    );
  };

  const clickedTower = this.mapTowersToPanelPositions(TOWERS).find(
    towerPanel => {
      return hasClickedOnTower(
        mouseX,
        mouseY,
        towerPanel.xStart,
        towerPanel.xEnd,
        towerPanel.yStart,
        towerPanel.yEnd
      );
    }
  );

  return clickedTower
    ? { tile: null, tower: clickedTower.type }
    : { tile: null, tower: null };
};

CanvasDisplay.prototype.drawGameOver = function() {
  const fontSize = FONT_SIZE_RATIO.LARGE * SCALE;
  this.context.font = `${fontSize}px ${DEFAULT_FONT_FAMILY}`;
  this.context.fillStyle = FONT_COLOR.DARK;
  this.context.fillText('GAME OVER', 0, SCALE * 2);
};
